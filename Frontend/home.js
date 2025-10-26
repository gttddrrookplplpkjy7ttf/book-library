document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("studentId");

  if (!token) {
    alert("กรุณาล็อกอินก่อน");
    window.location.href = "signin.html";
    return;
  }

  // ================== ดึงข้อมูลผู้ใช้ ==================
  try {
    const response = await fetch("https://library-project-lybd.onrender.com/api/student", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");

    const data = await response.json();
    const student = data.student;

    document.getElementById("idCard").textContent = student.studentId || "-";
    document.getElementById("username").textContent = student.name || "-";

    localStorage.setItem("studentId", student.studentId);
  } catch (error) {
    console.error("❌ Error fetching student info:", error);
    alert("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
  }

  // ================== วันที่ ==================
  const dateInput = document.getElementById("date");
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  dateInput.value = `${yyyy}-${mm}-${dd}`;
  dateInput.min = `${yyyy}-${mm}-${dd}`;

  // ================== เวลาเริ่มต้น/สิ้นสุด ==================
  const hourSelect = document.getElementById("hour");
  const startTimeSelect = document.getElementById("startTime");
  const endTimeSelect = document.getElementById("endTime");

  function renderTimeOptions(hour) {
    startTimeSelect.innerHTML = "";
    endTimeSelect.innerHTML = "";

    let times = [];

    if (hour === "2") {
      times = [
        { start: "09:00", end: "11:00" },
        { start: "11:00", end: "13:00" },
        { start: "13:00", end: "15:00" },
        { start: "15:00", end: "17:00" }
      ];
    } else {
      times = [
        { start: "09:00", end: "10:00" },
        { start: "10:00", end: "11:00" },
        { start: "11:00", end: "12:00" },
        { start: "12:00", end: "13:00" },
        { start: "13:00", end: "14:00" },
        { start: "14:00", end: "15:00" },
        { start: "15:00", end: "16:00" },
        { start: "16:00", end: "17:00" }
      ];
    }

    times.forEach(t => {
      const optStart = document.createElement("option");
      optStart.value = t.start;
      optStart.textContent = t.start;
      startTimeSelect.appendChild(optStart);

      const optEnd = document.createElement("option");
      optEnd.value = t.end;
      optEnd.textContent = t.end;
      endTimeSelect.appendChild(optEnd);
    });
  }

  renderTimeOptions(hourSelect.value);
  hourSelect.addEventListener("change", () => renderTimeOptions(hourSelect.value));

  // ================== ปุ่ม Search ==================
  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const floor = document.getElementById("floor")?.value;
      const date = document.getElementById("date")?.value;
      const startTime = startTimeSelect?.value;
      const endTime = endTimeSelect?.value;
      const hour = hourSelect?.value;
      const eq = document.querySelector('input[name="eq"]:checked')?.nextSibling?.textContent?.trim() || "";

      const url = `room.html?floor=${encodeURIComponent(floor)}&date=${encodeURIComponent(date)}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}&hour=${encodeURIComponent(hour)}&eq=${encodeURIComponent(eq)}`;
      window.location.href = url;
    });
  }

  // ================== ปุ่มรายการจองและ logout ==================
  document.getElementById("bookingListBtn")?.addEventListener("click", () => {
    window.location.href = "booking-list.html";
  });

  document.getElementById("logout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "signin.html";
  });
});
