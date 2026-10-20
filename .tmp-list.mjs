import fs from "fs"; import mongoose from "mongoose";
const env = Object.fromEntries(fs.readFileSync(".env.local","utf8").split("\n").filter(l=>l.includes("=")).map(l=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
for (const k of ["MONGODB_URI","SATTA_KING_FAST_MONGODB_URI"]) {
  try { const c = await mongoose.createConnection(env[k],{serverSelectionTimeoutMS:8000}).asPromise();
  const g = await c.db.collection("games").find({isActive:{$ne:false}}).sort({showIndex:1,name:1}).project({name:1,resultTime:1}).toArray();
  console.log(k, g.length, "| db:", c.db.databaseName); console.log(g.map(x=>`${x.name} (${x.resultTime||""})`).join(", ")); await c.close(); } catch(e){ console.log(k,"ERR",e.message) }
}
