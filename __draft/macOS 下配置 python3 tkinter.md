# macOS 下配置 python3 tkinter

最近需要使用 python gui，对比一圈决定使用 tkinter。

但在当前 macOS 环境下运行 python3 -m tkinter 一直报 no module named _tkinter 错误。

- mac 版本：Catalina 10.15.7
- python 版本：python@3.9: stable 3.9.6（brew 管理）

看到官方文档说需要安装 tcl/tk，用 brew install tcl/tk 命令安装（8.6.11 ）好后依然报错，查了一圈没找到解决办法，最后仔细读了下 brew info python 的说明，发现需要安装 python-tk@3.9，安装后解决问题。

```
lcn@MBP-LCN ~ % brew info python
python@3.9: stable 3.9.6 (bottled)
Interpreted, interactive, object-oriented programming language
https://www.python.org/
/usr/local/Cellar/python@3.9/3.9.6 (3,088 files, 55.0MB) *
  Poured from bottle on 2021-08-13 at 16:47:00
From: https://github.com/Homebrew/homebrew-core/blob/HEAD/Formula/python@3.9.rb
License: Python-2.0
==> Dependencies
Build: pkg-config ✘
Required: gdbm ✔, mpdecimal ✔, openssl@1.1 ✔, readline ✔, sqlite ✔, xz ✔
==> Caveats
Python has been installed as
  /usr/local/bin/python3

Unversioned symlinks `python`, `python-config`, `pip` etc. pointing to
`python3`, `python3-config`, `pip3` etc., respectively, have been installed into
  /usr/local/opt/python@3.9/libexec/bin

You can install Python packages with
  pip3 install <package>
They will install into the site-package directory
  /usr/local/lib/python3.9/site-packages

tkinter is no longer included with this formula, but it is available separately:
  brew install python-tk@3.9

See: https://docs.brew.sh/Homebrew-and-Python
==> Analytics
install: 683,624 (30 days), 1,853,934 (90 days), 8,218,357 (365 days)
install-on-request: 299,949 (30 days), 714,561 (90 days), 2,682,471 (365 days)
build-error: 0 (30 days)

```