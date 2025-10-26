// main.js
document.addEventListener("DOMContentLoaded", () => {
  const signInBtn = document.querySelector(".btn.primary");
  const signUpBtn = document.querySelector(".btn.secondary");

  if (signInBtn) {
    signInBtn.addEventListener("click", () => {
      window.location.href = "signin.html";
    });
  }

  if (signUpBtn) {
    signUpBtn.addEventListener("click", () => {
      window.location.href = "signup.html";
    });
  }
});
