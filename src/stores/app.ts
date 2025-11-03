import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const pageTitle = ref('首页');
  const canGoBack = ref(false);

  function setPageTitle(title: string, showBackButton = false) {
    pageTitle.value = title;
    canGoBack.value = showBackButton;
  }

  function goBack() {
    window.history.back();
  }

  return {
    pageTitle,
    canGoBack,
    setPageTitle,
    goBack
  };
});
