/**
 * Triggers direct browser download of the NutriPulse APK application package.
 */
export const triggerApkDownload = (): void => {
  try {
    const link = document.createElement('a');
    link.href = '/api/download-apk';
    link.download = 'NutriPulse-AI-v1.0.apk';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  } catch (err) {
    console.error('Download trigger error:', err);
    window.location.href = '/api/download-apk';
  }
};
