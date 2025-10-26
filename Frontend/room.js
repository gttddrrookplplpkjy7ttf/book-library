document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("กรุณาล็อกอินก่อน");
    window.location.href = "signin.html";
    return;
  }

  // ================== ดึงข้อมูลผู้ใช้ ==================
  let studentId = null;
  try {
    const res = await fetch("https://library-project-lybd.onrender.com/api/student", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
    const data = await res.json();
    const student = data.student;
    studentId = parseInt(student.studentId);
    document.getElementById("idCard").textContent = student.studentId || "-";
    document.getElementById("username").textContent = student.name || "-";
  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
  }

  // ================== ดึงค่าจาก URL ==================
  const urlParams = new URLSearchParams(window.location.search);
  const floor = urlParams.get("floor") || "-";
  const dateFromHome = urlParams.get("date") || "-";
  const startTimeFromHome = urlParams.get("startTime") || "08:00";
  const endTimeFromHome = urlParams.get("endTime") || "10:00";
  const hourFromHome = urlParams.get("hour") || "2";

  // ใส่ค่าลงฟอร์ม
  const inputs = document.querySelectorAll(".form-row input");
  if (inputs.length >= 3) {
    inputs[0].value = floor;
    inputs[1].value = dateFromHome;
    inputs[2].value = hourFromHome;
  }

  const startSelect = document.getElementById("startTime");
  const endSelect = document.getElementById("endTime");

  // ================== ใส่ตัวเลือกเวลา ==================
  function populateTimeOptions() {
    startSelect.innerHTML = "";
    endSelect.innerHTML = "";
    for (let h = 8; h <= 20; h++) {
      ["00", "30"].forEach(min => {
        const time = `${String(h).padStart(2, "0")}:${min}`;
        const startOption = document.createElement("option");
        startOption.value = time;
        startOption.textContent = time;
        startSelect.appendChild(startOption);

        const endOption = document.createElement("option");
        endOption.value = time;
        endOption.textContent = time;
        endSelect.appendChild(endOption);
      });
    }
  }
  populateTimeOptions();
  startSelect.value = startTimeFromHome;
  endSelect.value = endTimeFromHome;

  // ================== คำนวณชั่วโมงอัตโนมัติ ==================
  const hourInput = document.getElementById("hour");
  function updateHour() {
    const start = startSelect.value;
    const end = endSelect.value;
    if (!start || !end) return hourInput.value = "";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const duration = (eh + em / 60) - (sh + sm / 60);
    hourInput.value = duration > 0 ? duration : 0;
  }
  startSelect.addEventListener("change", updateHour);
  endSelect.addEventListener("change", updateHour);
  updateHour();

  // ================== ดึงข้อมูลห้อง ==================
  let rooms = [];
  try {
    const response = await fetch("https://library-project-lybd.onrender.com/api/rooms");
    if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูลห้องได้");
    rooms = await response.json();
  } catch (err) {
    console.error(err);
    document.getElementById("roomList").innerHTML = "<p>ไม่สามารถโหลดรายการห้องได้</p>";
    return;
  }

  // ================== ปุ่ม Back ==================
  document.getElementById("Backbtn").addEventListener("click", () => window.location.href = "home.html");

  // ================== ฟังก์ชัน render ห้อง ==================
  function renderRooms() {
    const roomList = document.getElementById("roomList");
    roomList.innerHTML = "";

    // กรองห้องตามชั้น/อาคาร
    const floorInput = inputs[0].value.trim();
    let allowedIds = [];
    if (floorInput.includes("ชั้น 1") && floorInput.includes("หอสมุดกลาง")) {
      allowedIds = [1, 2, 3, 4, 5];
    } else if (floorInput.includes("ชั้น 2") && floorInput.includes("หอสมุดกลาง")) {
      allowedIds = [6, 7, 8, 9, 10];
    } else if (floorInput.includes("ชั้น 3") && floorInput.includes("หอสมุดกลาง")) {
      allowedIds = [11, 12, 13, 14, 15];
    }

    const filteredRooms = rooms.filter(r => allowedIds.includes(r.id));

    filteredRooms.forEach(room => {
      const isAvailable = !room.bookings?.some(b => b.status === "CONFIRMED");
      const equipments = room.equipments ? room.equipments.join(" / ") : "-";

      const div = document.createElement("div");
      div.className = "room-card";
      div.innerHTML = `
        <img src="/Frontend/images/Study1.jpg" alt="${room.name}">
        <div class="room-info">
          <h4>${room.name}</h4>
          <p>จำนวนที่นั่ง: ${room.capacity || "-"}</p>
          <p>อุปกรณ์: ${equipments}</p>
          <p class="status ${isAvailable ? "available" : "unavailable"}">
            สถานะ: ${isAvailable ? "ว่าง" : "ไม่ว่าง"}
          </p>
        </div>
        <button class="btn-primary" ${isAvailable ? "" : "disabled"} data-room="${room.id}">จองห้อง</button>
      `;
      roomList.appendChild(div);
    });

    // ================== จองห้อง ==================
    document.querySelectorAll(".btn-primary").forEach(btn => {
      btn.addEventListener("click", async () => {
        try {
          const dateInput = inputs[1].value.trim();
          const startTime = startSelect.value.trim();
          const endTime = endSelect.value.trim();

          if (!studentId || !dateInput || !startTime || !endTime) {
            return alert("กรุณากรอกวันที่และเวลาให้ถูกต้อง");
          }

          function toISO(dateStr, timeStr) {
            dateStr = dateStr.trim();
            timeStr = timeStr.trim();
            let day, month, year;

            if (dateStr.includes("/")) {
              const parts = dateStr.split("/");
              if (parts.length !== 3) return null;
              day = parseInt(parts[0], 10);
              month = parseInt(parts[1], 10);
              year = parseInt(parts[2], 10);
              if (year > 2500) year -= 543;
            } else if (dateStr.includes("-")) {
              const parts = dateStr.split("-");
              if (parts.length !== 3) return null;
              year = parseInt(parts[0], 10);
              month = parseInt(parts[1], 10);
              day = parseInt(parts[2], 10);
            } else {
              return null;
            }

            const [hourStr, minuteStr] = timeStr.split(":");
            if (!hourStr || !minuteStr) return null;

            const dt = new Date(year, month - 1, day, parseInt(hourStr, 10), parseInt(minuteStr, 10), 0);
            return isNaN(dt.getTime()) ? null : dt.toISOString();
          }

          const startISO = toISO(dateInput, startTime);
          const endISO = toISO(dateInput, endTime);

          if (!startISO || !endISO) return alert("วันที่หรือเวลาไม่ถูกต้อง");

          const res = await fetch("https://library-project-lybd.onrender.com/api/bookings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              studentId,
              roomId: parseInt(btn.dataset.room),
              startTime: startISO,
              endTime: endISO
            })
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "เกิดข้อผิดพลาดในการจองห้อง");
          }

          const data = await res.json();

          // ================== แสดง Modal ==================
          const modal = document.getElementById("successModal");
          modal.style.display = "flex";

          // ปรับสถานะห้อง
          btn.disabled = true;
          const statusEl = btn.closest(".room-card").querySelector(".status");
          statusEl.textContent = "สถานะ: ไม่ว่าง";
          statusEl.classList.remove("available");
          statusEl.classList.add("unavailable");

          // ================== ปุ่ม Modal ==================
          const okBtn = document.getElementById("okBtn");
          const cancelBtn = document.getElementById("cancelBtn");

          okBtn.onclick = () => {
            modal.style.display = "none";
            window.location.href = "home.html";
          };

          cancelBtn.onclick = async () => {
            modal.style.display = "none";
            try {
              if (!data.booking || !data.booking.id) return;

              const cancelRes = await fetch(`https://library-project-lybd.onrender.com/api/bookings/${data.booking.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
              });

              if (!cancelRes.ok) {
                const errData = await cancelRes.json();
                throw new Error(errData.message || "เกิดข้อผิดพลาดในการยกเลิกการจอง");
              }

              alert("ยกเลิกการจองเรียบร้อยแล้ว");

              // ปรับสถานะห้องให้กลับเป็นว่าง
              btn.disabled = false;
              statusEl.textContent = "สถานะ: ว่าง";
              statusEl.classList.remove("unavailable");
              statusEl.classList.add("available");

            } catch (err) {
              console.error(err);
              alert(err.message);
            }
          };
        } catch (err) {
          console.error(err);
          alert(err.message);
        }
      });
    });
  }

  renderRooms(); // เรียกแสดงห้อง
});
