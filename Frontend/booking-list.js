// ================== Constants ==================
const API_URL = "https://library-project-lybd.onrender.com/api/bookings";

// ================== ฟังก์ชันช่วย ==================
// แปลงวันที่เป็น dd/mm/yyyy
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// แปลงเวลาเป็น hh:mm
function formatTime(dateString) {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// ================== ดึงข้อมูลผู้ใช้ ==================
async function fetchStudent() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("กรุณาล็อกอินก่อน");
    window.location.href = "signin.html";
    return;
  }

  try {
    const res = await fetch("https://library-project-lybd.onrender.com/api/student", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    const student = data.student;

    document.getElementById("idCard").textContent = student.studentId || "-";
    document.getElementById("username").textContent = student.name || "-";

  } catch (error) {
    console.error("Error fetching student info:", error);
    document.getElementById("idCard").textContent = "-";
    document.getElementById("username").textContent = "-";
  }
}

// ================== ดึงข้อมูลการจอง ==================
async function fetchBookings() {
  const TOKEN = localStorage.getItem("token");
  if (!TOKEN) {
    alert("กรุณาล็อกอินก่อน");
    window.location.href = "signin.html";
    return;
  }

  try {
    const response = await fetch(API_URL, {
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const bookings = await response.json();
    displayBookings(bookings);

  } catch (error) {
    console.error("Error fetching bookings:", error);
    document.getElementById("bookingList").innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:red;">
          ไม่สามารถดึงข้อมูลได้ (401 Unauthorized)
        </td>
      </tr>
    `;
  }
}

// ================== แสดงตารางการจอง ==================
function displayBookings(bookings) {
  const tbody = document.getElementById("bookingList");

  if (!Array.isArray(bookings)) {
    console.error("Data is not an array:", bookings);
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:red;">
          ข้อมูลไม่ถูกต้อง
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = bookings.map(booking => {
    const start = formatTime(booking.startTime);
    const end = formatTime(booking.endTime);
    const date = formatDate(booking.startTime);
    const participantName = booking.participants?.[0]?.student?.name || "-";

    return `
      <tr>
        <td>${booking.roomName}</td>
        <td>${participantName}</td>
        <td>${date}</td>
        <td>${start} - ${end}</td>
        <td><button onclick="editBooking(${booking.id})">แก้ไข</button></td>
      </tr>
    `;
  }).join("");
}

// ================== ฟังก์ชันแก้ไข ==================
function editBooking(id) {
  alert(`คุณต้องการแก้ไขการจองหมายเลข ${id}`);
}

// ================== จัดการเมนู ==================
function setupMenu() {
  const menuItems = document.querySelectorAll(".menu ul li");
  if (!menuItems.length) return;

  // การจองห้อง
  menuItems[0].addEventListener("click", () => {
    window.location.href = "home.html";
  });

  // ออกจากระบบ
  menuItems[2].addEventListener("click", () => {
    localStorage.removeItem("token"); // ลบ token
    window.location.href = "signin.html";
  });
}

// ================== เรียกใช้เมื่อโหลดหน้า ==================
document.addEventListener("DOMContentLoaded", async () => {
  await fetchStudent();
  await fetchBookings();
  setupMenu();
});


// ================== ฟังก์ชันแก้ไข ==================
let selectedBookingId = null;

// แก้ไขการจอง → เปิด modal
function editBooking(id) {
  selectedBookingId = id;
  const modal = document.getElementById("cancelModal");
  modal.style.display = "block";
}

// ปิด modal
document.querySelector(".close").onclick = () => {
  document.getElementById("cancelModal").style.display = "none";
};

document.getElementById("cancelModalBtn").onclick = () => {
  document.getElementById("cancelModal").style.display = "none";
};

// กดยืนยันยกเลิกการจอง
document.getElementById("confirmCancel").onclick = async () => {
  if (!selectedBookingId) return;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`https://library-project-lybd.onrender.com/api/bookings/${selectedBookingId}`, {
      method: "DELETE", // หรือ PATCH ขึ้นกับ API
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    alert("ยกเลิกการจองสำเร็จ");
    document.getElementById("cancelModal").style.display = "none";
    // รีเฟรชหน้า booking-list
    window.location.href = "booking-list.html";

  } catch (error) {
    console.error("Error cancelling booking:", error);
    alert("ไม่สามารถยกเลิกการจองได้");
  }
};

// ปิด modal หากคลิกนอก modal
window.onclick = (event) => {
  const modal = document.getElementById("cancelModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

