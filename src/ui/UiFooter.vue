<template>
  <footer class="ui-footer">
    <div class="ui-footer__links"><slot /></div>
    <p v-if="$slots.note" class="ui-footer__note"><slot name="note" /></p>
  </footer>
</template>

<style>
.ui-footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-4);
  border-top: var(--size-border) solid var(--color-border-default);
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  font: 400 var(--font-size-sm) / var(--font-line-normal) var(--font-family-body);
}

.ui-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.ui-footer__note {
  color: var(--color-text-muted);
}
</style>
