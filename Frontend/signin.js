document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  const messageBox = document.getElementById("messageBox");
  const createAccountBtn = document.querySelector(".btn-create");

  // ปุ่ม "Create new account" -> ไปหน้าสมัครสมาชิก
  createAccountBtn.addEventListener("click", () => {
    window.location.href = "/Frontend/signup.html";
  });

  // เมื่อกด SIGN IN
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const studentId = document.getElementById("studentId").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!studentId || !password) {
      messageBox.textContent = "กรุณากรอก ID Card และ Password ให้ครบถ้วน";
      messageBox.style.color = "red";
      return;
    }

    try {
      const response = await fetch("https://library-project-lybd.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, password })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ บันทึก token และ studentId ลง localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("studentId", studentId);
        window.location.href = "home.html";
        
        messageBox.textContent = "เข้าสู่ระบบสำเร็จ กำลังเข้าสู่หน้า Home...";
        messageBox.style.color = "green";

        // ไปหน้า home.html พร้อมส่งข้อมูลใน query string
        // (จะได้เอาไปใช้ในหน้า home.html ได้ด้วย)
        setTimeout(() => {
          const url = `/Frontend/home.html?studentId=${encodeURIComponent(studentId)}`;
          window.location.href = url;
        }, 1500);
      } else {
        messageBox.textContent = data.message || "รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง";
        messageBox.style.color = "red";
      }
    } catch (error) {
      console.error("Login error:", error);
      messageBox.textContent = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
      messageBox.style.color = "red";
    }
  });
});
