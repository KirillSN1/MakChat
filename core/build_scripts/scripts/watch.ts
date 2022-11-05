import { watchFile } from "fs";
import getFiles from "../moduls/get_files";
import devbuild from "./dev";

const excludeDir = ["node_modules", "dist", "storage", "public", "build_scripts"];
const match = /\.ts$/;
getFiles("./",{ excludeDir, match}).then((files)=>{
    const builder = devbuild();
    files.forEach(file=>watchFile(file,{ persistent:true }, ()=>builder.build()));
});