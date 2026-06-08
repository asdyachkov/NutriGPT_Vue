<template>
  <div class="not-found">
    <!-- Animated background blobs -->
    <div class="not-found__bg">
      <div class="blob blob--1" />
      <div class="blob blob--2" />
      <div class="blob blob--3" />
    </div>

    <div class="not-found__content">
      <div class="not-found__plate">🍽️</div>
      <h1 class="not-found__code">404</h1>
      <h2 class="not-found__title">Страница не найдена</h2>
      <p class="not-found__text">Похоже, это блюдо отсутствует в нашем меню</p>
      <div class="not-found__actions">
        <BaseButton variant="primary" size="lg" @click="$router.push('/dashboard')">
          🏠 На главную
        </BaseButton>
        <BaseButton variant="outline" size="lg" @click="$router.back()">
          ← Назад
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/common/BaseButton.vue'
</script>

<style scoped lang="scss">
.not-found {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  overflow: hidden;
  padding: 32px;

  &__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  &__content {
    position: relative;
    z-index: 1;
    animation: fadeInUp 0.6s ease both;
  }

  &__plate {
    font-size: 80px;
    margin-bottom: 16px;
    animation: float 3s ease-in-out infinite;
  }

  &__code {
    font-size: 96px;
    font-weight: 800;
    line-height: 1;
    background: linear-gradient(135deg, #2D6A4F 0%, #40916C 50%, #F4A261 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__title {
    font-size: 24px;
    font-weight: 600;
    color: #212529;
    margin-top: 12px;
  }

  &__text {
    font-size: 16px;
    color: #6C757D;
    margin: 8px 0 32px;
  }

  &__actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;

  &--1 {
    width: 400px; height: 400px;
    background: #2D6A4F;
    top: -100px; right: -100px;
    animation: blobMove1 8s ease-in-out infinite;
  }
  &--2 {
    width: 300px; height: 300px;
    background: #F4A261;
    bottom: -50px; left: -50px;
    animation: blobMove2 10s ease-in-out infinite;
  }
  &--3 {
    width: 250px; height: 250px;
    background: #457B9D;
    top: 40%; left: 50%;
    animation: blobMove3 12s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@keyframes blobMove1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-40px, 30px) scale(1.1); }
}
@keyframes blobMove2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -20px) scale(1.15); }
}
@keyframes blobMove3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -30px) scale(0.9); }
  66% { transform: translate(-15px, 20px) scale(1.1); }
}
</style>
