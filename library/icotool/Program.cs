/*
 * Created by SharpDevelop.
 * User: Administrator
 * Date: 2016-6-29
 * Time: 17:42
 * 
 * To change this template use Tools | Options | Coding | Edit Standard Headers.
 */
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Text.RegularExpressions;
using System.Collections.Generic;

namespace icotool
{
	class Program
	{
		private static string[] parseCmd(string cmd){
			
			const string quote="$<quote>";
			const string singlequote="$<singlequote>";
			cmd = cmd.Replace("\\\"",quote).Replace("\\'",singlequote);
			Regex reg = new Regex("\"([^\"]+)\"|'([^']+)'|(\\S+)");
			MatchCollection matches = reg.Matches(cmd);
			string[] args = new String[matches.Count];
			for (int i = 0; i < matches.Count; i++) {
				Match m = matches[i];
				int gi=1;
				while(String.IsNullOrEmpty(m.Groups[gi].Value)){
					gi++;
				}
				string para = m.Groups[gi].Value.Replace(quote,"\"").Replace(singlequote,"'");
				args[i] = para;
			}
			return args;
		}
		public static void Main(string[] args)
		{
			args = parseCmd(System.Environment.CommandLine);
			List<string> input =new List<string>() , output=new List<string>();
			bool isInput = false, isOutput=false;
			for (int i = 0; i < args.Length; i++) {
				string arg = args[i].Trim();
				if(arg == "-i"){
					isInput = true;
					isOutput=false;
				}else if (arg=="-o") {
					isOutput=true;
					isInput=false;
				}else if(isInput){
					input.Add(arg);
				}else if(isOutput){
					output.Add(arg);
				}
			}				
			//Console.WriteLine("Hello World!,"+args+","+cmd);
			if(input.Count!=output.Count){
				Console.WriteLine("input count must be same as output count!");
				return;
			}
			// TODO: Implement Functionality Here
			for (int i = 0; i < input.Count; i++) {
				IcoTool.GetFileIcon(input[i])
					.ToBitmap().Save(output[i], ImageFormat.Png);
			}
			
//				IcoTool.GetFileIcon(@"C:\Documents and Settings\Administrator\桌面\360极速浏览器.lnk")
//					.ToBitmap().Save(@"C:\Documents and Settings\Administrator\桌面\360极速浏览器.bmp");
//			Console.Write("Press any key to continue . . . ");
//			Console.ReadKey(true);
		}
	}
}