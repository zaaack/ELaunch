using System;

using System.Data;

using System.Configuration;

using System.Drawing;

using System.Runtime.InteropServices;

/// <summary>

/// Class1 的摘要说明

/// </summary>

public class IcoTool

{

	public IcoTool()

	{

		//

		// TODO: 在此处添加构造函数逻辑

		//

	}

	[StructLayout(LayoutKind.Sequential)]

	public struct SHFILEINFO

	{

		public IntPtr hIcon;

		public IntPtr iIcon;

		public uint dwAttributes;

		[MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)]

		public string szDisplayName;

		[MarshalAs(UnmanagedType.ByValTStr, SizeConst = 80)]

		public string szTypeName;

	}

	/// <summary>

	/// 返回系统设置的图标

	/// </summary>

	/// <param name="pszPath">文件路径 如果为"" 返回文件夹的</param>

	/// <param name="dwFileAttributes">0</param>

	/// <param name="psfi">结构体</param>

	/// <param name="cbSizeFileInfo">结构体大小</param>

	/// <param name="uFlags">枚举类型</param>

	/// <returns>-1失败</returns>

	[DllImport("shell32.dll")]

	public static extern IntPtr SHGetFileInfo(string pszPath, uint dwFileAttributes, ref   SHFILEINFO psfi, uint cbSizeFileInfo, uint uFlags);

	public enum SHGFI

	{

		SHGFI_ICON = 0x100,

		SHGFI_LARGEICON = 0x0,

		SHGFI_USEFILEATTRIBUTES = 0x10

	}

	/// <summary>

	/// 获取文件图标 wen_zuo@163.com

	/// </summary>

	/// <param name="p_Path">文件全路径</param>

	/// <returns>图标</returns>

	public static Icon GetFileIcon(string p_Path)

	{

		SHFILEINFO _SHFILEINFO = new SHFILEINFO();

		IntPtr _IconIntPtr = SHGetFileInfo(p_Path, 0, ref _SHFILEINFO, (uint)Marshal.SizeOf(_SHFILEINFO), (uint)(SHGFI.SHGFI_ICON | SHGFI.SHGFI_LARGEICON | SHGFI.SHGFI_USEFILEATTRIBUTES));

		if (_IconIntPtr.Equals(IntPtr.Zero)) return null;

		Icon _Icon = System.Drawing.Icon.FromHandle(_SHFILEINFO.hIcon);
		return _Icon;

	}

	/// <summary>

	/// 获取文件夹图标

	///wen_zuo@163.com

	/// </summary>

	/// <returns>图标</returns>

	public static Icon GetDirectoryIcon()

	{

		SHFILEINFO _SHFILEINFO = new SHFILEINFO();

		IntPtr _IconIntPtr = SHGetFileInfo(@"", 0, ref _SHFILEINFO, (uint)Marshal.SizeOf(_SHFILEINFO), (uint)(SHGFI.SHGFI_ICON | SHGFI.SHGFI_LARGEICON));

		if (_IconIntPtr.Equals(IntPtr.Zero)) return null;

		Icon _Icon = System.Drawing.Icon.FromHandle(_SHFILEINFO.hIcon);

		return _Icon;

	}

}