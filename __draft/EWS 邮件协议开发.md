# EWS 邮件协议开发

## 认证

目前从抓包 iOS Mail app、网易邮箱大师、小米邮件app等，均使用基本认证，即添加 Authorization Header，格式：``` Authorization: Basic base64($username:$password)```


## Web 服务地址获取

### 自动获取

用户仅需填写邮箱和密码，使用方便。根据[官方文档](https://docs.microsoft.com/zh-cn/exchange/client-developer/exchange-web-services/autodiscover-for-exchange)说明：

#### 首先要构建发现终结点（就是 URL）候选列表，列表由以下组成部分：

|    来源    | URL格式 | 优先级 ｜
| --------- | ------ | ------ |
| AD DS 域服务器 | 服务器返回 | 高 ｜
| Email 域名拼接 | "https://" + domain + "/autodiscover/autodiscover" + *fileExtension* | 低 ｜
| Email 域名拼接 | "https://autodiscover." + domain + "/autodiscover/autodiscover" + *fileExtension* | 最低 ｜

*域名拼接方式虽然在文档中的优先级低，但从目前了解的情况看，国内环境该方式更通用。fileExtension 的值取决于您使用的自动发现访问方法： SOAP 或 POX。SOAP 服务使用".svc"文件扩展名，POX 使用".xml"。POX 请求体更简单，目前看到的客户端都使用这种方式*

#### 然后发送请求

比如 Email 是 test@ews.sina.com，然后从列表中依次请求发现 https://autodiscover.ews.sina.com/autodiscover/autodiscover.xml 是通的，发送的请求为 xml body

- **官网给出的请求示例，注意命名空间是 /outlook/requestschema/2006，获取到的 URL 以 /ews/exchange.asmx 结尾，使用 SOAP 协议进行通信**

```
<Autodiscover xmlns="https://schemas.microsoft.com/exchange/autodiscover/outlook/requestschema/2006">
   <Request>
     <EMailAddress>user@contoso.com</EMailAddress>
     <AcceptableResponseSchema>https://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a</AcceptableResponseSchema>
   </Request>
</Autodiscover>

// 该命名空间会请求完整的 Outlook 功能，服务器会将所有支持的 URL 返回，其中 ASUrl 就是用于 Email 通信的接口，交互协议为 SOAP。
// 只截取部分响应，完整请求和响应示例见[官网文档](https://docs.microsoft.com/en-us/exchange/client-developer/web-service-reference/pox-autodiscover-web-service-reference-for-exchange)
···

<Protocol>
  <Type>EXCH</Type>
  <Server>MBX-SERVER.mail.internal.contoso.com</Server>
  <ServerDN>/o=contoso/ou=Exchange Administrative Group (FYDIBOHF23SPDLT)/cn=Configuration/cn=Servers/cn=MBX-SERVER</ServerDN>
  <ServerVersion>72008287</ServerVersion>
  <MdbDN>/o=contoso/ou=Exchange Administrative Group (FYDIBOHF23SPDLT)/cn=Configuration/cn=Servers/cn=MBX-SERVER/cn=Microsoft Private MDB</MdbDN>
  <ASUrl>https://mail.contoso.com/ews/exchange.asmx</ASUrl>
  <OOFUrl>https://mail.contoso.com/ews/exchange.asmx</OOFUrl>
  <UMUrl>https://mail.contoso.com/unifiedmessaging/service.asmx</UMUrl>
  <OABUrl>https://mail.contoso.com/OAB/d29844a9-724e-468c-8820-0f7b345b767b/</OABUrl>
</Protocol>

···

```

- **抓包发现目前客户端都使用命名空间 mobilesync/requestschema/2006，获取到的 URL 以 /Microsoft-Server-ActiveSync 结尾，使用 MS-ASHTTP 协议进行通信**

```
// 请求 Body
<?xml version="1.0" encoding="utf-8"?>
<Autodiscover xmlns="http://schemas.microsoft.com/exchange/autodiscover/mobilesync/requestschema/2006"> 
  <Request> 
    <EMailAddress>test@ews.sina.com</EMailAddress> 
    <AcceptableResponseSchema>http://schemas.microsoft.com/exchange/autodiscover/mobilesync/responseschema/2006</AcceptableResponseSchema> 
  </Request> 
</Autodiscover>

// 响应 Body
<?xml version="1.0" encoding="utf-8"?>
<Autodiscover xmlns="http://schemas.microsoft.com/exchange/autodiscover/responseschema/2006">
  <Response xmlns="http://schemas.microsoft.com/exchange/autodiscover/mobilesync/responseschema/2006">
    <Culture>en:us</Culture>
    <User>
      <DisplayName>测试</DisplayName>
      <EMailAddress>test@ews.sina.com</EMailAddress>
    </User>
    <Action>
      <Settings>
        <Server>
          <Type>MobileSync</Type>
          <Url>https://othertestß.sina.com/Microsoft-Server-ActiveSync</Url>
          <Name>https://othertest.sina.com/Microsoft-Server-ActiveSync</Name>
        </Server>
      </Settings>
    </Action>
  </Response>
</Autodiscover>
```

- [SOAP 协议 EWS operations 文档](https://docs.microsoft.com/en-us/exchange/client-developer/web-service-reference/ews-operations-in-exchange)
- [MS-ASHTTP Exchange 同步协议文档](https://docs.microsoft.com/zh-cn/openspecs/exchange_server_protocols/ms-ashttp/4cbf28dc-2876-41c6-9d87-ba9db86cd40d)

注意


### 手动配置

从目前抓包测试的客户端都是通过 Microsoft-Server-ActiveSync 协议和 Exchange Server 进行交互的，其 body xml 更加简单。所以都是将用户填写的服务器地址拼接后直接使用。

格式：https://*$serverurl*/Microsoft-Server-ActiveSync
