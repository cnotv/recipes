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
.recipe-skeleton {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
  min-height: 400px; /* Match typical recipe card height */
  display: flex;
  flex-direction: column;
}

.skeleton-image {
  position: relative;
  height: 200px;
  background: #f3f4f6;
}

.skeleton-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 60px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
}

.skeleton-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-title {
  height: 24px;
  border-radius: 4px;
}

.skeleton-ingredients {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-steps {
  margin-top: 8px;
}

.skeleton-line {
  height: 16px;
  border-radius: 4px;
}

.skeleton-button {
  height: 44px;
  border-radius: 8px;
  margin-top: auto;
}

.skeleton-placeholder {
  background: #e5e7eb;
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #e5e7eb 25%,
    #f3f4f6 50%,
    #e5e7eb 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
