# Openssl 命令

## 生成 RSA 密钥对

### 生成密钥
```
openssl genrsa -out rsa_private_key.pem 1024
```

### 根据密钥提取公钥
```
openssl rsa -in rsa_private_key.pem -pubout -out rsa_public_key.pem
```


## 使用 rsautl 命令加解密，中括号是需要替换的文本

### 加密
```
// 1、通过 echo 命令直接将明文文本传入管道，并将最终结果打印，也可用通过 -in 从文件输入，-out输出到文件
// 2、-encrypt：加密，-pkcs：对应 Java 中的 PKCS1Padding，-inkey 指定密钥路径，-pubin 指定传入密钥为公钥，加密结果为字节数组，用管道输出到下一步
// 3、base64 编码，-e：编码，-A：单行输出结果，如果不指定，结果过长的话会自动通过换行拆分
echo [明文文本] | openssl rsautl -encrypt -pkcs -inkey rsa_public_key.pem -pubin | openssl base64 -A -e
```

### 解密
```
// 1、通过 echo 将密文传入管道，以便最终在 bash 中打印，也可以使用 -in 参数从文件输入
// 2、base64 解码，-d：解码，-A：从整行中解码，如果密文为单行（且超过默认拆分时的单行长度），解码时需要指定 -A，否则无法输出
// 3、解码结果用管道发给 rsautl 解密
echo [base64编码后的密文] | openssl base64 -A -d | openssl rsautl -decrypt -pkcs -inkey rsa_private_key.pem
```

