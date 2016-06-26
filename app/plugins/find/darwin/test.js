const child = require('child_process');
var time = process.hrtime()
const find = child.execFile('find "/Users/z" \\( -path "**/.*" -o -path "**/node_*" \\)  -a -prune -o \\( -type d -o -type f \\) -name "aaaaaaa" -print | grep "." -m 1',(err,stdout,stderr)=>{

  console.log(err,stdout,stderr,process.hrtime(time));
})
