
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const GROUP_ID = 35285300;

app.post('/check', async (req, res) => {
  try {
    const username = req.body.username;
    if (!username) return res.json({ ok:false, msg:"no username" });

    let uid = await axios.get(`https://users.roblox.com/v1/usernames/users`, {
      data:{ usernames:[username] }
    }).catch(()=>null);

    if (!uid || !uid.data || !uid.data.data[0]) 
      return res.json({ ok:false, msg:"ID not found" });

    uid = uid.data.data[0].id;

    const member = await axios.get(
      `https://groups.roblox.com/v1/groups/${GROUP_ID}/users/${uid}`
    ).catch(()=>null);

    if (!member || !member.data || !member.data.role) 
      return res.json({ ok:false, msg:"not_in_group" });

    const joined = new Date(member.data.joinedAt);
    const now = new Date();
    const diff = Math.floor((now - joined) / (1000*60*60*24));

    if (diff >= 14) 
      return res.json({ ok:true, msg:"allowed" });

    return res.json({ ok:false, msg:"not_14", left: 14 - diff });
  } catch (e) {
    return res.json({ ok:false, msg:"error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on "+PORT));
