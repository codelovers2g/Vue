<template>
  <div ref="cargo" class="cargoMoving" :style="style">
    <div class="cargoMoving_content">
      <p class="text-proxima-bold cargoMoving_text">{{ cargo.uldNumber }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, inject } from 'vue';

import {
  moveOriginOfLateralCoordinates,
  createLocationFromDOMPosition,
  dispatchAllocateEvent,
  dispatchMoveCargoEvent,
} from '@/constants/functions';

import { DOMState } from '@/store/dom.types';
import { CargoActionTypes, CargoMutationTypes } from '@/store/cargo.types';
import { MiscMutationTypes } from '@/store/misc.types';

export default defineComponent({
  props: {
    cargo: {
      type: Object as PropType<Cargo.Cargo>,
      required: true,
    },
  },

  setup() {
    return {
      mousePosition: inject('mousePosition') as CargoVisualization.Coordinates,
      actualMousePosition: inject(
        'actualMousePosition'
      ) as CargoVisualization.Coordinates,
      mouseUpCount: inject('mouseUpCount') as number,
    };
  },

  data() {
    return {
      snapped: false as boolean,
      lastPoint: null as Grid.DOMPoint | null,

      start: [0, 0] as CargoVisualization.Coordinates,
      position: [0, 0] as CargoVisualization.Coordinates,
      mouseOffset: [0, 0] as CargoVisualization.Coordinates,

      orientation: 'Depth' as Aircraft.Location['orientation'],

      DOMPosition: null as CargoVisualization.BaseDOMPosition | null,
    };
  },

  computed: {
    size() {
      let length = 100;
      let width = 100;

      if (this.cargo.base) {
        length =
          this.cargo.base.length +
          this.cargo.overhang.before +
          this.cargo.overhang.after;
        width =
          this.cargo.base.width + this.cargo.overhang.left + this.cargo.overhang.right;
      }

      if (this.orientation === 'Width') {
        const temp = length;
        length = width;
        width = temp;
      }

      const scaledWidth = width * this.$store.state.dom.scale;
      const scaledLength = length * this.$store.state.dom.scale;

      return { width, length, scaledWidth, scaledLength };
    },

    style() {
      const { scaledWidth, scaledLength } = this.size;

      const notIdleStyles =
        this.$store.state.cargo.movingState !== 'IDLE'
          ? {
              width: `${scaledLength}px`,
              height: `${scaledWidth}px`,
              left: `${this.mouseOffset[0]}px`,
              top: `${this.mouseOffset[1]}px`,
            }
          : null;

      return {
        ...notIdleStyles,
        transform: `translate(${this.position[0]}px, ${this.position[1]}px)`,
        backgroundColor:
          this.$store.state.misc.destinationOptions[this.cargo.destination] ??
          'var(--color-primary-midnight-blue)',
      };
    },
  },

  watch: {
    // Use event listener from outside the component, as the mousemove event only
    // fires when hovering over the uld. There are times when the mouse is not
    // over the uld and listening to only the event of this DOM
    // element will not work
    mousePosition: {
      handler(): void {
        if (this.$store.state.cargo.movingState !== 'MOVING') {
          return;
        }

        if (window.getSelection()) {
          window.getSelection()?.empty();
        }

        this.positionCargo();
      },
      deep: true,
    },
    // Same reasoning as in mousePosition here.
    mouseUpCount(): void {
      switch (this.cargo.allocation.type) {
        case 'Bulk':
          this.bulkDrop();
          break;
        case 'ConnectedLat':
          this.connectedLatDrop();
          break;
        case 'ConnectedLong':
          this.connectedLongDrop();
          break;
        default:
          this.defaultDrop();
          break;
      }
    },

    // Recenter the ULD on the mouse whenever the orientation is changed
    // TODO: Change the offset based on the nearest point
    orientation(): void {
      const { scaledWidth, scaledLength } = this.size;

      this.mouseOffset = [
        this.start[0] - scaledLength / 2,
        this.start[1] - scaledWidth / 2,
      ];
    },
  },

  mounted() {
    const { scaledWidth, scaledLength } = this.size;

    this.start = [this.mousePosition[0], this.mousePosition[1]];

    this.mouseOffset = [
      this.mousePosition[0] - scaledLength / 2,
      this.mousePosition[1] - scaledWidth / 2,
    ];
  },

  methods: {
    computeDOMPosition() {
      const domResult = {
        isFloor: false,
        result: false,
        DOMPosition: {
          context: {
            verticalSequence: 0,
          },
          coordinates: [0, 0] as CargoVisualization.Coordinates,
          width: 0,
          length: 0,
        },
      };

      // Get the shadow dom first, as document.elementsFromPoint would not
      // return the element that we actually want
      const shadowRoot = this.$store.state.dom.shadowRoot;

      // This shouldn't happen.
      if (!shadowRoot) {
        throw new Error('CargoBlockMoving: shadowRoot not found');
      }

      // Get the floor element. This is done this way as we don't have any idea
      // what floor the ULD is placed on. This assumes that there are cases
      // where no grids will be shown and there will be no nearest point.
      const floor = shadowRoot
        .elementsFromPoint(this.actualMousePosition[0], this.actualMousePosition[1])
        .filter((element) => element.classList.contains('floor'))[0] as HTMLElement;

      // There is no floor found underneath the mouse position. Hence, this is
      // an invalid position for the ULD
      if (!floor) {
        domResult.isFloor = false;
        return domResult;
      }
      domResult.isFloor = true;

      const cargoEl = this.$refs.cargo as Element;

      const cargoRect = cargoEl.getBoundingClientRect();
      const floorRect = floor.getBoundingClientRect();

      // Calculate the offset of the cargo from the floor, minus the padding.
      // Divided by scale to get measurements in inches

      const left = (cargoRect.left - floorRect.left - 10) / this.$store.state.dom.scale;
      const top = (cargoRect.top - floorRect.top - 10) / this.$store.state.dom.scale;
      const right =
        (floorRect.right - cargoRect.right - 10) / this.$store.state.dom.scale;
      const bottom =
        (floorRect.bottom - cargoRect.bottom - 10) / this.$store.state.dom.scale;

      // If either of these are zero, then the ULD is not
      // within the confines of the floor. This however does not check the
      // complex geometry of the nose and tail. It assumes that the airplane is a
      // box.
      if (left < 0 || top < 0 || right < 0 || bottom < 0) {
        // return false;
        domResult.result = false;
        return domResult;
      }

      // return {
      //   context: {
      //     verticalSequence: Number(floor.dataset.index ?? 0) + 1,
      //   },
      //   coordinates: [left, top] as CargoVisualization.Coordinates,
      //   width: this.size.width,
      //   length: this.size.length,
      // };

      domResult.isFloor = true;
      domResult.result = true;
      domResult.DOMPosition = {
        context: {
          verticalSequence: Number(floor.dataset.index ?? 0) + 1,
        },
        coordinates: [left, top] as CargoVisualization.Coordinates,
        width: this.size.width,
        length: this.size.length,
      };
      return domResult;
    },

    /* POSITIONING FUNCTIONS */
    positionCargo() {
      // Coerce type to key of trees. This is assured since grids must
      // corresponed to positioning type.
      const allocationType =
        this.cargo.allocation.type.toLowerCase() as keyof DOMState['trees'];

      // Get the nearest point to the mouse cursor
      const nearest = this.$store.state.dom.trees[allocationType]?.nearest(
        {
          normalizedLongitudinalCoordinate: this.mousePosition[0],
          normalizedLateralCoordinate: this.mousePosition[1],
        },
        1
      )[0];

      // Handle when there are no points available
      if (!nearest) {
        this.defaultMovement();
        return;
      }

      // Destructure nearest point. Done this way to type cast nearest[0] to Grid.DOMPoint
      const nearestPoint = nearest[0] as Grid.DOMPoint;
      const distance = nearest[1];

      const { shouldSnap, offset } = this.getSnapAndOffset(nearestPoint);

      // Handle movement if the ULD has snapped to a point, and it should now snap in a line
      if (
        this.snapped &&
        nearestPoint.lineSnap !== 'NONE' &&
        distance < nearestPoint.transformedMaximumDistance &&
        distance > nearestPoint.transformedMinimumDistance
      ) {
        this.lineMovement(nearestPoint);
        return;
      }

      // Handle movement if ULD should snap to the nearest point
      if (distance < nearestPoint.transformedMaximumDistance && shouldSnap) {
        this.snapMovement(nearestPoint, offset);
        return;
      }

      // Handle if no special movement should occur
      this.defaultMovement();
    },

    defaultMovement() {
      this.snapped = false;
      this.lastPoint = null;

      this.DOMPosition = null;
      this.orientation = 'Depth';

      this.position = [
        this.mousePosition[0] - this.start[0],
        this.mousePosition[1] - this.start[1],
      ];

      return;
    },

    lineMovement(nearestPoint: Grid.DOMPoint) {
      // Checks if the last known nearest point is not equal to the current
      // nearest point. If true, this means the uld should now snap to a
      // different point
      if (
        this.lastPoint?.normalizedLateralCoordinate !==
          nearestPoint.normalizedLateralCoordinate ||
        this.lastPoint?.normalizedLongitudinalCoordinate !==
          nearestPoint.normalizedLongitudinalCoordinate
      ) {
        this.snapped = false;
        return;
      }

      const modifiedAxis = nearestPoint.lineSnap === 'LONGITUDINAL' ? 0 : 1;

      this.position[modifiedAxis] =
        this.mousePosition[modifiedAxis] - this.start[modifiedAxis];

      return;
    },

    snapMovement(nearestPoint: Grid.DOMPoint, offset: CargoVisualization.Coordinates) {
      this.snapped = true;
      this.lastPoint = nearestPoint;
      this.orientation = nearestPoint.orientation;

      // Width and height here have already changed if the orientation of the
      // element should change
      const { width, length, scaledWidth, scaledLength } = this.size;

      this.position = [
        nearestPoint.normalizedLongitudinalCoordinate -
          this.start[0] +
          (scaledLength / 2) * offset[0],
        nearestPoint.normalizedLateralCoordinate -
          this.start[1] +
          (scaledWidth / 2) * offset[1],
      ];

      // Offset is based on the center of the uld, and x and y is set to
      // the upper left of the uld. x and y is first transformed to point to the
      // center of the uld, rather than the center to avoid recalculating offset.

      this.DOMPosition = {
        coordinates: [
          nearestPoint.longitudinalCoordinate - length / 2 + (length / 2) * offset[0],
          moveOriginOfLateralCoordinates(nearestPoint.lateralCoordinate) -
            width / 2 +
            (width / 2) * offset[1],
        ],
        width,
        length,
        context: {
          verticalSequence: nearestPoint.verticalSequence,
        },
      };
    },

    getSnapAndOffset(nearestPoint: Grid.DOMPoint): {
      shouldSnap: boolean;
      offset: [number, number];
    } {
      // shouldSnap checks if the position of the uld is within the area the point
      // should attract ULDs.
      // For ex: a ULD at CL should snap IF the ULD is on the upper right
      // of the snapping point.

      const {
        normalizedLongitudinalCoordinate,
        normalizedLateralCoordinate,
        longitudinalBehavior,
        lateralBehavior,
      } = nearestPoint;

      // Compute if mouse position is negative when compared to the point
      const isNegative = [
        this.mousePosition[0] - normalizedLongitudinalCoordinate < 0,
        this.mousePosition[1] - normalizedLateralCoordinate < 0,
      ];

      // offset determines if the current uld position should be
      // moved to the left, right, up or down. This offset is based on the center
      // of the moving ULD. If offset is 1, it moves the ULD to the positive
      // direction. If -1, it moves to the negative direction
      const offset = [1, 1] as [number, number];
      let shouldSnap = false;

      switch (longitudinalBehavior) {
        case 'POSITIVE':
          if (!isNegative[0]) {
            shouldSnap = true;
          }
          break;
        case 'NEGATIVE':
          if (isNegative[0]) {
            shouldSnap = true;
            offset[0] = -1;
          }
          break;
        case 'CENTER':
          shouldSnap = true;
          offset[0] = 0;
          break;
        case 'NONE':
          shouldSnap = true;
          break;
        default:
          break;
      }

      switch (lateralBehavior) {
        case 'POSITIVE':
          if (!isNegative[1]) {
            shouldSnap = shouldSnap && true;
          } else {
            shouldSnap = false;
          }
          break;
        case 'NEGATIVE':
          if (isNegative[1]) {
            shouldSnap = shouldSnap && true;
            offset[1] = -1;
          } else {
            shouldSnap = false;
          }
          break;
        case 'CENTER':
          shouldSnap = shouldSnap && true;
          offset[1] = 0;
          break;
        case 'NONE':
          shouldSnap = true;
          break;
        default:
          break;
      }

      return {
        shouldSnap,
        offset,
      };
    },

    intersectionValidation() {
      if (!this.DOMPosition) {
        throw new TypeError('CargoBlockMoving: DOMPosition not calculated');
      }

      let verticalSequence = 1;

      switch (this.cargo.allocation.type) {
        case 'ConnectedLong': {
          return;
        }
        case 'ConnectedLat': {
          return;
        }
        case 'Regular': {
          let position = null;

          try {
            position = this.getPosition();
          } catch {
            return;
          }

          if (!position.DOMPosition.context) {
            throw new TypeError('CargoBlockMoving: Expected position to have context');
          }

          if (
            !Object.prototype.hasOwnProperty.call(
              position.DOMPosition.context,
              'verticalSequence'
            )
          ) {
            throw new TypeError(
              'CargoMutation.DROP_CARGO_IN_DOM: Expected position to have context with verticalSequence'
            );
          }

          verticalSequence = position.DOMPosition.context.verticalSequence;
          break;
        }
        case 'Bulk': {
          let position = null;

          try {
            position = this.getPosition();
          } catch {
            return;
          }

          if (!position.DOMPosition.context) {
            throw new TypeError('CargoBlockMoving: Expected position to have context');
          }

          if (
            !Object.prototype.hasOwnProperty.call(
              position.DOMPosition.context,
              'verticalSequence'
            )
          ) {
            throw new TypeError(
              'CargoMutation.DROP_CARGO_IN_DOM: Expected position to have context with verticalSequence'
            );
          }

          verticalSequence = position.DOMPosition.context.verticalSequence;
          break;
        }

        default: {
          if (!this.DOMPosition.context) {
            throw new TypeError('CargoBlockMoving: Expected position to have context');
          }

          if (
            !Object.prototype.hasOwnProperty.call(
              this.DOMPosition.context,
              'verticalSequence'
            )
          ) {
            throw new TypeError(
              'CargoMutation.DROP_CARGO_IN_DOM: Expected position to have context with verticalSequence'
            );
          }

          verticalSequence = this.DOMPosition.context.verticalSequence;
        }
      }

      if (this.$store.state.cargo.allocatedCargos.length < verticalSequence) {
        throw new TypeError(
          'CargoBlockMoving: number of floors does not correspond to calculated vertical sequence'
        );
      }
      for (const cargo of this.$store.state.cargo.allocatedCargos[
        verticalSequence - 1
      ]) {
        if (this.cargo.uldNumber === cargo.uldNumber) {
          continue;
        }

        const cargoLocation = createLocationFromDOMPosition(this.DOMPosition);
        const currentCargoLocation = createLocationFromDOMPosition(cargo.DOMPosition);

        if (
          cargoLocation.end < currentCargoLocation.begin ||
          currentCargoLocation.end < cargoLocation.begin
        ) {
          continue;
        }

        if (
          cargoLocation.latEnd < currentCargoLocation.latBegin ||
          currentCargoLocation.latEnd < cargoLocation.latBegin
        ) {
          continue;
        }

        this.$store.commit(MiscMutationTypes.ADD_VALIDATION, {
          severity: 'Warning',
          message: `${this.cargo.uldNumber} intersects with ${cargo.uldNumber}`,
          ulds: [],
          positions: ['INTERNAL_POSITION'],
        });

        return true;
      }

      return false;
    },

    getPosition() {
      if (!this.lastPoint) {
        throw new TypeError('CargoBlockMoving: Expected point to exist');
      }

      if (!this.lastPoint.context) {
        throw new TypeError('CargoBlockMoving: Expected point to have context');
      }

      if (!Object.prototype.hasOwnProperty.call(this.lastPoint.context, 'iataCode')) {
        throw new TypeError(
          'CargoBlockMoving: Expected point to have context with iataCode'
        );
      }

      if (!this.$store.state.aircraft.positions) {
        throw new TypeError('CargoBlockMoving: No aircraft positions found');
      }

      const position =
        this.$store.state.aircraft.positions[this.lastPoint.context.iataCode];

      if (!position) {
        throw new TypeError(
          `CargoBlockMoving: no position object found for iataCode: ${this.lastPoint.context.iataCode}`
        );
      }

      return position;
    },

    defaultDrop() {
      // Compute position if the uld is not snapped to any point
      if (!this.DOMPosition) {
        const DOMPosition = this.computeDOMPosition();

        // check floor
        if (DOMPosition.isFloor == false) {
          this.$store.dispatch(CargoActionTypes.RESET_CARGO);
          return;
        }
        // If the position is not computed, then that means that the cargo position
        // is not valid
        if (DOMPosition.isFloor == true && DOMPosition.result == false) {
          this.$store.dispatch(CargoActionTypes.RESET_CARGO);
          this.$store.commit(MiscMutationTypes.ADD_VALIDATION, {
            severity: 'Warning',
            message: `${this.cargo.uldNumber} was dropped in an invalid position`,
            ulds: [],
            positions: ['INTERNAL_POSITION'],
          });

          return;
        }
        let positions = null;
        try {
          positions = this.getPosition();
        } catch {
          console.log('Error');
          this.$store.dispatch(CargoActionTypes.RESET_CARGO);
          this.$store.commit(MiscMutationTypes.ADD_VALIDATION, {
            severity: 'Warning',
            message: `${this.cargo.uldNumber} was dropped in an invalid position`,
            ulds: [],
            positions: ['INTERNAL_POSITION'],
          });
          return;
        }

        // this.DOMPosition = DOMPosition;
        this.DOMPosition = DOMPosition.DOMPosition;
      }

      // Calculate if elements are intersecting
      const intersectionError = this.intersectionValidation();

      if (intersectionError) {
        this.$store.dispatch(CargoActionTypes.RESET_CARGO);
        return;
      }

      const fromAllocatedCargo = this.$store.state.cargo.allocatedCargos
        .flat()
        .some((allocatedCargo) => allocatedCargo.uldNumber === this.cargo.uldNumber);

      this.$store.dispatch(CargoActionTypes.DROP_CARGO, {
        cargo: this.cargo,
        position: this.DOMPosition,
      });

      if (fromAllocatedCargo) {
        dispatchMoveCargoEvent(this.$store.state.dom.shadowRoot, {
          uldNumber: this.cargo.uldNumber,
          allocationType: this.cargo.allocation.type,
          location: createLocationFromDOMPosition(this.DOMPosition),
          context: this.lastPoint?.context,
        });
      } else {
        dispatchAllocateEvent(this.$store.state.dom.shadowRoot, {
          uldNumber: this.cargo.uldNumber,
          allocationType: this.cargo.allocation.type,
          location: createLocationFromDOMPosition(this.DOMPosition),
          context: this.lastPoint?.context,
        });
      }
    },

    bulkDrop() {
      // console.log("what in get position ======",this.getPosition())

      // let position = null;
      // try {
      //  console.log("what in get position in if condition======",this.getPosition())

      //   position = this.getPosition();
      // } catch {
      //   console.log("what in get position in catch block======",this.getPosition())
      //   this.$store.dispatch(CargoActionTypes.RESET_CARGO);
      //   this.$store.commit(MiscMutationTypes.ADD_VALIDATION, {
      //     severity: 'Warning',
      //     message: `${this.cargo.uldNumber} is expected to snap to a position`,
      //     ulds: [],
      //     positions: ['INTERNAL_POSITION'],
      //   });
      //   return;
      // }
      // console.log("what in get position after try catch======",this.getPosition())
      // this.$store.dispatch(CargoActionTypes.DROP_BULK_CARGO, {
      //   position:this.getPosition(),
      //   cargo: this.cargo,
      // });
      // return;

      if (!this.DOMPosition) {
        const DOMPosition = this.computeDOMPosition();

        // check floor
        if (DOMPosition.isFloor == false) {
          this.$store.dispatch(CargoActionTypes.RESET_CARGO);
          return;
        }
        // If the position is not computed, then that means that the cargo position
        // is not valid
        if (DOMPosition.isFloor == true && DOMPosition.result == false) {
          this.$store.dispatch(CargoActionTypes.RESET_CARGO);
          this.$store.commit(MiscMutationTypes.ADD_VALIDATION, {
            severity: 'Warning',
            message: `${this.cargo.uldNumber} was dropped in an invalid position`,
            ulds: [],
            positions: ['INTERNAL_POSITION'],
          });

          return;
        }
        let positions = null;
        try {
          positions = this.getPosition();
        } catch {
          console.log('Error');
          this.$store.dispatch(CargoActionTypes.RESET_CARGO);
          this.$store.commit(MiscMutationTypes.ADD_VALIDATION, {
            severity: 'Warning',
            message: `${this.cargo.uldNumber} was dropped in an invalid position`,
            ulds: [],
            positions: ['INTERNAL_POSITION'],
          });
          return;
        }

        // this.DOMPosition = DOMPosition;
        this.DOMPosition = DOMPosition.DOMPosition;
      }

      // Calculate if elements are intersecting
      const intersectionError = this.intersectionValidation();

      if (intersectionError) {
        this.$store.dispatch(CargoActionTypes.RESET_CARGO);
        return;
      }

      const fromAllocatedCargo = this.$store.state.cargo.allocatedCargos
        .flat()
        .some((allocatedCargo) => allocatedCargo.uldNumber === this.cargo.uldNumber);

      this.$store.dispatch(CargoActionTypes.DROP_BULK_CARGO, {
        cargo: this.cargo,
        position: this.getPosition(),
      });

      if (fromAllocatedCargo) {
        dispatchMoveCargoEvent(this.$store.state.dom.shadowRoot, {
          uldNumber: this.cargo.uldNumber,
          allocationType: this.cargo.allocation.type,
          location: createLocationFromDOMPosition(this.DOMPosition),
          context: this.lastPoint?.context,
        });
      } else {
        dispatchAllocateEvent(this.$store.state.dom.shadowRoot, {
          uldNumber: this.cargo.uldNumber,
          allocationType: this.cargo.allocation.type,
          location: createLocationFromDOMPosition(this.DOMPosition),
          context: this.lastPoint?.context,
        });
      }
    },

    connectedLatDrop() {
      if (!this.DOMPosition) {
        const DOMPosition = this.computeDOMPosition();

        if (DOMPosition.isFloor == false) {
          return;
        }

        // If the position is not computed, then that means that the cargo position
        // is not valid
        if (DOMPosition.isFloor == true && DOMPosition.result == false) {
          this.$store.dispatch(CargoActionTypes.RESET_CARGO);
          this.$store.commit(MiscMutationTypes.ADD_VALIDATION, {
            severity: 'Warning',
            message: `${this.cargo.uldNumber} was dropped in an invalid position`,
            ulds: [],
            positions: ['INTERNAL_POSITION'],
          });
          return;
        }
        this.DOMPosition = DOMPosition.DOMPosition;
      }

      const intersectionError = this.intersectionValidation();

      if (intersectionError) {
        this.$store.dispatch(CargoActionTypes.RESET_CARGO);
        return;
      }

      let position = null;
      try {
        position = this.getPosition();
      } catch {
        this.$store.dispatch(CargoActionTypes.RESET_CARGO);
        this.$store.commit(MiscMutationTypes.ADD_VALIDATION, {
          severity: 'Warning',
          message: `${this.cargo.uldNumber} is expected to snap to a position`,
          ulds: [],
          positions: ['INTERNAL_POSITION'],
        });
        return;
      }

      if (position.allowedConnectedPositions?.lateral.length === 0) {
        throw new TypeError('CargoBlockMoving: expected allowedConnectedPositions');
      }

      if (!this.cargo.allocation.connectedUld) {
        throw new TypeError('CargoBlockMoving: expected connectedUld');
      }

      const positions = this.getAvailableConnectedPositions(
        position.allowedConnectedPositions!.lateral
      );

      if (positions.length === 0) {
        this.$store.dispatch(CargoActionTypes.RESET_CARGO);
        this.$store.commit(MiscMutationTypes.ADD_VALIDATION, {
          severity: 'Warning',
          message: 'No available position for connected ULD',
          ulds: [],
          positions: ['INTERNAL_POSITION'],
        });

        return;
      }

      this.defaultDrop();

      this.$store.commit(CargoMutationTypes.SET_CONNECTED_CARGOS, {
        cargo: this.cargo.allocation.connectedUld,
        positions,
      });
    },

    connectedLongDrop() {
      if (!this.DOMPosition) {
        const DOMPosition = this.computeDOMPosition();

        //Check floor
        if (DOMPosition.isFloor == false) {
          return;
        }

        // If the position is not computed, then that means that the cargo position
        // is not valid
        if (DOMPosition.isFloor == true && DOMPosition.result == false) {
          this.$store.dispatch(CargoActionTypes.RESET_CARGO);
          this.$store.commit(MiscMutationTypes.ADD_VALIDATION, {
            severity: 'Warning',
            message: `${this.cargo.uldNumber} was dropped in an invalid position`,
            ulds: [],
            positions: ['INTERNAL_POSITION'],
          });
          return;
        }

        this.DOMPosition = DOMPosition.DOMPosition;
      }

      const intersectionError = this.intersectionValidation();

      if (intersectionError) {
        this.$store.dispatch(CargoActionTypes.RESET_CARGO);
        return;
      }

      let position = null;
      try {
        position = this.getPosition();
      } catch {
        this.$store.dispatch(CargoActionTypes.RESET_CARGO);
        this.$store.commit(MiscMutationTypes.ADD_VALIDATION, {
          severity: 'Warning',
          message: `${this.cargo.uldNumber} is expected to snap to a position`,
          ulds: [],
          positions: ['INTERNAL_POSITION'],
        });
        return;
      }

      if (position.allowedConnectedPositions?.longitudinal.length === 0) {
        throw new TypeError('CargoBlockMoving: expected allowedConnectedPositions');
      }

      if (!this.cargo.allocation.connectedUld) {
        throw new TypeError('CargoBlockMoving: expected connectedUld');
      }

      const positions = this.getAvailableConnectedPositions(
        position.allowedConnectedPositions!.longitudinal
      );

      if (positions.length === 0) {
        this.$store.dispatch(CargoActionTypes.RESET_CARGO);
        this.$store.commit(MiscMutationTypes.ADD_VALIDATION, {
          severity: 'Warning',
          message: 'No available position for connected ULD',
          ulds: [],
          positions: ['INTERNAL_POSITION', 'TO_FORCE'],
        });

        return;
      }

      this.defaultDrop();

      this.$store.commit(CargoMutationTypes.SET_CONNECTED_CARGOS, {
        cargo: this.cargo.allocation.connectedUld,
        positions,
      });
    },

    getAvailableConnectedPositions(allowedConnectedPositions: string[]) {
      const allCargos = this.$store.state.cargo.allocatedCargos
        .flat()
        .map((cargo) => cargo.allocation.positions)
        .flat();

      return allowedConnectedPositions.filter(
        (position) => !allCargos.includes(position)
      );
    },
  },
});
</script>
