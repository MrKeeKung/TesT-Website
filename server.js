const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const GROUP_ID = 35285300;

app.post("/check", async (req, res) => {
  try {
    const username = req.body.username;
    if (!username) return res.json({ ok: false, message: "No username provided" });

    const userReq = await axios.get(
      `https://api.roblox.com/users/get-by-username?username=${username}`
    );
    if (!userReq.data.Id)
      return res.json({ ok: false, message: "ຊື່ Roblox ບໍ່ຖືກຕ້ອງ" });

    const userId = userReq.data.Id;

    const groupReq = await axios.get(
      `https://groups.roblox.com/v2/users/${userId}/groups/roles`
    );

    const inGroup = groupReq.data.data.find((g) => g.group.id === GROUP_ID);
    if (!inGroup) {
      return res.json({ ok: false, message: "ໄອດີບໍ່ໄດ້ຢູ່ໃນກຸ່ມ" });
    }

    const joinReq = await axios.get(
      `https://groups.roblox.com/v1/users/${userId}/groups/roles`
    );
    const g = joinReq.data.data.find((x) => x.group.id === GROUP_ID);

    const joinDate = new Date(g.created);
    const now = new Date();
    const diffDays = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));

    if (diffDays < 14) {
      return res.json({
        ok: false,
        message: `ໄອດີຍັງເຂົ້າກຸ່ມບໍ່ຄົບ (${14 - diffDays} ມື້ຍັງເຫຼືອ)`
      });
    }

    return res.json({ ok: true, message: "ໄອດີນີ້ເຕີມໄດ້ແລ້ວ" });
  } catch (e) {
    return res.json({ ok: false, message: "Server error" });
  }
});

app.listen(3000, () => console.log("Server running on 3000"));
