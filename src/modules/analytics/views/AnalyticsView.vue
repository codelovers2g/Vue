<script setup lang="ts">
import { computed } from 'vue';
import { useInventoryStore } from '@/modules/inventory/store/inventoryStore';
import type { StockIntelligence, StockPrediction } from '../models/analytics.model';
import BaseCard from '@/components/ui/BaseCard.vue';

const store = useInventoryStore();

/**
 * Predictive Intelligence Logic
 * Analyzes store inventory to generate health scores and stockout forecasts.
 */
const stockIntelligence = computed<StockIntelligence>(() => {
  const totalItems = store.products.length;
  const lowStockCount = store.lowStockProducts.length;
  const healthScore = totalItems ? Math.round(((totalItems - lowStockCount) / totalItems) * 100) : 0;
  
  // Predict days until stockout for low stock items (simulated)
  const predictions: StockPrediction[] = store.lowStockProducts.map(p => ({
    name: p.name,
    daysLeft: Math.floor(p.stock / (Math.random() * 2 + 0.5)) + 1,
    urgency: p.stock < 5 ? 'Critical' : 'Warning'
  }));

  return { healthScore, predictions };
});

const getScoreColor = (score: number) => {
  if (score > 80) return 'var(--color-success)';
  if (score > 50) return 'var(--color-warning)';
  return 'var(--color-danger)';
};
</script>

<template>
  <div class="analytics-view">
    <header class="view-header">
      <div class="title-area">
        <h1>Predictive Intelligence</h1>
        <p class="subtitle">AI-driven inventory forecasting and stock health</p>
      </div>
    </header>

    <div class="analytics-grid">
      <!-- Health Score Card -->
      <BaseCard class="health-card">
        <div class="circular-score">
          <svg viewBox="0 0 100 100">
            <circle class="bg" cx="50" cy="50" r="45" />
            <circle 
              class="progress" 
              cx="50" cy="50" r="45" 
              :style="{ 
                strokeDashoffset: (283 - (283 * stockIntelligence.healthScore) / 100),
                stroke: getScoreColor(stockIntelligence.healthScore)
              }"
            />
          </svg>
          <div class="score-text">
            <span class="number">{{ stockIntelligence.healthScore }}%</span>
            <span class="label">Stock Health</span>
          </div>
        </div>
        <div class="health-meta">
          <p v-if="stockIntelligence.healthScore > 80">Your inventory levels are optimal. No immediate action required.</p>
          <p v-else-if="stockIntelligence.healthScore > 50">Some items require attention soon to prevent stockouts.</p>
          <p v-else>Critical stock levels detected. Restock immediately.</p>
        </div>
      </BaseCard>

      <!-- Forecast Analysis -->
      <BaseCard title="Stockout Predictions" class="forecast-card">
        <div v-if="stockIntelligence.predictions.length === 0" class="empty-analytics">
          <p>No stockout risks detected for current inventory.</p>
        </div>
        <div v-else class="prediction-list">
          <div v-for="pred in stockIntelligence.predictions" :key="pred.name" class="prediction-item">
            <div class="item-info">
              <span class="item-name">{{ pred.name }}</span>
              <span class="urgency-tag" :class="pred.urgency.toLowerCase()">{{ pred.urgency }}</span>
            </div>
            <div class="forecast-label">
              Predicted stockout in <span class="days">{{ pred.daysLeft }} days</span>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Segment Distribution Analysis -->
       <BaseCard title="Category Distribution" class="chart-card">
          <div class="bar-chart-sim">
            <div v-for="cat in ['Electronics', 'Accessories', 'Furniture']" :key="cat" class="chart-row">
              <span class="row-label">{{ cat }}</span>
              <div class="row-bar-container">
                <div 
                  class="row-bar" 
                  :style="{ width: (Math.random() * 60 + 20) + '%' }"
                ></div>
              </div>
            </div>
          </div>
       </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.analytics-view {
  animation: slideUp 0.8s var(--ease-premium);
}

.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  grid-template-rows: auto auto;
  gap: var(--space-xl);
}

.health-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.circular-score {
  position: relative;
  width: 180px;
  height: 180px;
  margin-bottom: var(--space-lg);
}

svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

circle {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
}

circle.bg {
  stroke: var(--color-glass);
}

circle.progress {
  stroke-dasharray: 283;
  transition: stroke-dashoffset 1.5s ease;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
}

.score-text .number {
  font-size: 2.2rem;
  font-weight: 800;
}

.score-text .label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.health-meta {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  max-width: 250px;
}

.prediction-item {
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-glass-border);
}

.prediction-item:last-child { border: none; }

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.item-name { font-weight: 600; }

.urgency-tag {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  text-transform: uppercase;
}

.urgency-tag.critical { background: rgba(239, 68, 68, 0.2); color: var(--color-danger); }
.urgency-tag.warning { background: rgba(245, 158, 11, 0.2); color: var(--color-warning); }

.forecast-label { font-size: 0.85rem; color: var(--color-text-muted); }
.days { color: var(--color-text-main); font-weight: 700; }

/* Chart Sim */
.chart-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}
.row-label { width: 100px; font-size: 0.85rem; color: var(--color-text-muted); }
.row-bar-container { flex: 1; height: 12px; background: var(--color-glass); border-radius: 6px; overflow: hidden; }
.row-bar { height: 100%; background: var(--color-primary); border-radius: 6px; }

@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>
