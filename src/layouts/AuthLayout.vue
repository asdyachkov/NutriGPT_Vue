<template>
  <div class="auth-layout">
    <!-- Animated background -->
    <div class="auth-bg">
      <div class="auth-blob auth-blob--1" />
      <div class="auth-blob auth-blob--2" />
      <div class="auth-blob auth-blob--3" />
      <div class="auth-blob auth-blob--4" />
    </div>

    <div class="auth-card">
      <div class="auth-card__logo">
        <div class="auth-card__icon-wrap">
          <span class="auth-card__icon">🥗</span>
        </div>
        <h1 class="auth-card__title">NutriGPT</h1>
        <p class="auth-card__tagline">Персонализированное питание с AI</p>
      </div>
      <div class="auth-card__body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-4;
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, var(--primary-dark) 0%, #1a3a2a 40%, #0f2018 100%);
}

.auth-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.auth-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);

  &--1 {
    width: 500px; height: 500px;
    background: rgba(var(--primary-light-rgb), 0.25);
    top: -15%; right: -10%;
    animation: authBlob1 10s ease-in-out infinite;
  }
  &--2 {
    width: 400px; height: 400px;
    background: rgba(var(--accent-rgb), 0.15);
    bottom: -10%; left: -5%;
    animation: authBlob2 12s ease-in-out infinite;
  }
  &--3 {
    width: 300px; height: 300px;
    background: rgba(var(--info-rgb), 0.12);
    top: 50%; left: 30%;
    animation: authBlob3 8s ease-in-out infinite;
  }
  &--4 {
    width: 200px; height: 200px;
    background: rgba(#fff, 0.04);
    top: 20%; right: 30%;
    animation: authBlob1 15s ease-in-out infinite reverse;
  }
}

@keyframes authBlob1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-30px, 20px) scale(1.05); }
  66% { transform: translate(15px, -15px) scale(0.95); }
}
@keyframes authBlob2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(25px, -30px) scale(1.1); }
}
@keyframes authBlob3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, 10px) scale(1.08); }
  66% { transform: translate(-10px, -20px) scale(0.92); }
}

.auth-card {
  position: relative;
  z-index: 1;
  background: rgba(var(--surface-rgb), 0.95);
  backdrop-filter: blur(20px);
  border-radius: $radius-xl;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
  width: 100%;
  max-width: 440px;
  overflow: hidden;
  animation: fadeInScale 0.5s ease;

  &__logo {
    text-align: center;
    padding: $space-8 $space-6 $space-4;
    background: linear-gradient(180deg, rgba(var(--primary-rgb), 0.04) 0%, transparent 100%);
  }
  &__icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--accent-rgb), 0.1));
    margin-bottom: $space-3;
  }
  &__icon { font-size: 36px; }
  &__title {
    font-size: 28px;
    font-weight: $font-weight-bold;
    color: var(--primary);
    margin: 0;
    letter-spacing: -0.5px;
  }
  &__tagline {
    font-size: $font-size-sm;
    color: var(--text-muted);
    margin-top: $space-1;
  }
  &__body {
    padding: $space-4 $space-6 $space-8;
  }
}
</style>
