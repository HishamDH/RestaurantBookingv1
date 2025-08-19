
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');
  if (!container) return;
  const goSignUp = () => container.classList.add('right-panel-active');
  const goSignIn = () => container.classList.remove('right-panel-active');
  document.getElementById('toSignUp')?.addEventListener('click', goSignUp);
  document.getElementById('toSignIn')?.addEventListener('click', goSignIn);
  document.getElementById('switchToSignup')?.addEventListener('click', (e) => { e.preventDefault(); goSignUp(); });
  document.getElementById('switchToLogin')?.addEventListener('click', (e) => { e.preventDefault(); goSignIn(); });
});
