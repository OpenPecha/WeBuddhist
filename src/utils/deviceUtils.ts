export const isMobileDevice = (): boolean =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const APP_OPEN_PATH = "/open";

export const openAppDownloadPage = (): void => {
  window.location.assign(APP_OPEN_PATH);
};
