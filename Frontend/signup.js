//Backend
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  const messageBox = document.getElementById("messageBox");

  console.log("form:", form);
  console.log("messageBox:", messageBox);

  if (!form) return console.error("❌ ไม่พบ form id='signupForm'");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      studentId: document.getElementById("studentId").value.trim(),
      name: document.getElementById("name").value.trim(),
      password: document.getElementById("password").value.trim()
    };

    console.log("📤 Sending data:", data);
    messageBox.textContent = "⏳ กำลังสมัครสมาชิก...";
    messageBox.style.color = "blue";

    try {
        const response = await fetch("https://library-project-lybd.onrender.com/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("✅ Server response:", result);

        if (!response.ok) throw new Error(result.message || "Registration failed");

        // แสดงข้อความก่อนเปลี่ยนหน้า
        messageBox.textContent = result.message || "สมัครสมาชิกสำเร็จ!";
        messageBox.style.color = "green";

        // รีเซ็ตฟอร์ม
        form.reset();

        // รอสักครู่แล้วเปลี่ยนหน้า
        setTimeout(() => {
            window.location.href = "signin.html";
        }, 1000); // รอ 1 วินาทีเพื่อให้ผู้ใช้เห็นข้อความ
        } catch (error) {
        console.error("❌ Error:", error);
        messageBox.textContent = "❌ เกิดข้อผิดพลาด: " + error.message;
        messageBox.style.color = "red";
        }
  });
});