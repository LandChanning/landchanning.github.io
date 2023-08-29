# gradlew

## 输出依赖
./gradlew -q app:dependencies

## 打包
./gradlew assemble[Flavor+buildType]
./gradlew installFlavor+buildType]

# adb

## 安装
adb install [Filename]

## 请求root权限（设备已 root ）
adb root

## 导出
adb pull [Filename] [Filename]

## 导入
adb push [Filename] [Filename]

## 进入 shell 模式
adb shell

### 获取管理员权限（设备已 root ）
$ su

### 使用 sqlite3 工具操作数据库
$ sqlite3 [Database Filename]

#### 查看数据库下所有表
sqlite> .table

#### 帮助
sqlite> .help

#### 输出模式
sqlite> .mode

#### 通过 SQL 语句操作表
sqlite> [SQL语句，注意冒号结尾]
