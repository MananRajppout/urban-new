import env from "../src/config/env.js";
import connectDB from "../src/config/database.js";

async function main() {
  await connectDB();
  // const agent = new AgentModel();
  // await agent.save();

  // const aiAgent=new AgentModel();
  // const agents=await AgentModel.find()
  // console.log(agents)

  // find by id
}

main();
