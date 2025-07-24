<template>
  <div class="recipe-skeleton">
    <div class="skeleton-image">
      <div class="skeleton-placeholder skeleton-shimmer"></div>
      <div class="skeleton-badge"></div>
    </div>
    <div class="skeleton-content">
      <div class="skeleton-title skeleton-placeholder skeleton-shimmer"></div>
      <div class="skeleton-ingredients">
        <div class="skeleton-line skeleton-placeholder skeleton-shimmer"></div>
        <div class="skeleton-line skeleton-placeholder skeleton-shimmer" style="width: 80%;"></div>
      </div>
      <div class="skeleton-steps">
        <div class="skeleton-line skeleton-placeholder skeleton-shimmer" style="width: 60%;"></div>
      </div>
      <div class="skeleton-button skeleton-placeholder skeleton-shimmer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed for skeleton
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

* {
  font-family: var(--theme-font-primary, 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
}

.recipe-skeleton {
  background: var(--theme-card-gradient, linear-gradient(135deg, #fff 0%, #f8fafc 100%));
  border-radius: 25px;
  box-shadow: 0 4px 20px rgba(74, 144, 226, 0.2);
  overflow: hidden;
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  border: 2px solid var(--theme-primary, #4a90e2);
  position: relative;
  animation: gentleFloat 4s ease-in-out infinite;
}

@keyframes gentleFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.recipe-skeleton::before {
  content: var(--theme-primary-icon, '⚡');
  position: absolute;
  top: -5px;
  left: -5px;
  background: var(--theme-surface, #fff);
  color: var(--theme-primary, #4a90e2);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid var(--theme-primary, #4a90e2);
  z-index: 2;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.skeleton-image {
  position: relative;
  height: 200px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
}

.skeleton-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 70px;
  height: 25px;
  background: linear-gradient(135deg, #4a90e2, #3478d4);
  border-radius: 25px;
  opacity: 0.7;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 0.9; }
}

.skeleton-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
}

.skeleton-title {
  height: 24px;
  border-radius: 15px;
}

.skeleton-ingredients {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(248, 250, 252, 0.8);
  padding: 15px;
  border-radius: 20px;
  border: 2px solid rgba(74, 144, 226, 0.2);
  position: relative;
}

.skeleton-ingredients::before {
  content: '⚡';
  position: absolute;
  top: -8px;
  left: 15px;
  background: #fff;
  color: #4a90e2;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: 2px solid #4a90e2;
}

.skeleton-steps {
  margin-top: 8px;
}

.skeleton-line {
  height: 16px;
  border-radius: 10px;
}

.skeleton-button {
  height: 40px;
  border-radius: 25px;
  margin-top: auto;
}

.skeleton-placeholder {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgba(74, 144, 226, 0.1) 0%,
    rgba(52, 120, 212, 0.3) 25%,
    rgba(116, 185, 255, 0.3) 50%,
    rgba(74, 144, 226, 0.3) 75%,
    rgba(74, 144, 226, 0.1) 100%
  );
  background-size: 300% 100%;
  animation: kawaiShimmer 2.5s infinite;
}

@keyframes kawaiShimmer {
  0% {
    background-position: -300% 0;
  }
  100% {
    background-position: 300% 0;
  }
}
</style>
