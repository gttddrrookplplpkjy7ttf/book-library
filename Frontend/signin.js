document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  const messageBox = document.getElementById("messageBox");
  const createAccountBtn = document.querySelector(".btn-create");

  // ✅ ตรวจว่าปุ่มมีอยู่จริงก่อน
  if (createAccountBtn) {
    createAccountBtn.addEventListener("click", () => {
      console.log("🟦 Redirecting to signup.html...");
      window.location.href = "signup.html"; // ✅ ปรับ path ให้ตรงจริง (ไม่ต้อง /Frontend ถ้าไฟล์อยู่โฟลเดอร์เดียวกัน)
    });
  } else {
    console.warn("⚠️ ไม่พบปุ่ม .btn-create ในหน้า HTML");
  }

  if (!form) {
    console.error("❌ ไม่พบฟอร์ม id='signupForm'");
    return;
  }

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
        localStorage.setItem("token", data.token);
        localStorage.setItem("studentId", studentId);

        messageBox.textContent = "เข้าสู่ระบบสำเร็จ กำลังเข้าสู่หน้า Home...";
        messageBox.style.color = "green";

        setTimeout(() => {
          window.location.href = "home.html";
        }, 1000);
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
