// var https = require('https');
// https.get('https://www.so.com', (res) => {
//   var html = ''
//   res.on('data',(data)=>{
//     html+=data
//   })
//   res.on('end',data=>{
//     console.log(html);
//   })
// })

const exec = require('child_process').exec;
const child = exec('ls -a kakls *.js bad_file | wc -l',
  (error, stdout, stderr) => {
    console.log(`error: ${error}`);
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
});
