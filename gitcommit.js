import { exec } from "child_process";
import { format } from "date-fns";

const gitcommit = () => {
  let now = new Date();
  console.log(`${format(now, "yyyy-MM-dd HH:mm:SS")}`);
  exec(
    `
    git pull
    git add dataSource
    git commit -m "${format(now, "yyyy MMdd")}"
    git push
  `,
    (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    }
  );
};

export default gitcommit;

// gitcommit();
