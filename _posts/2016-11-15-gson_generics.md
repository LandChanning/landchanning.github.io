---
layout:     post
title:      "Gson遇上泛型"
subtitle:   ""
date:       2016-11-15 16:00
author:     "Channing"
header-img: "img/post-bg-2015.jpg"
tags:
    - Gson
---

## Gson中使用泛型 ##

例：JSON字符串数组

["Android","Java","PHP"]

当我们要通过Gson解析这个json时，一般有两种方式：使用数组，使用List。而List对于增删都是比较方便的，所以实际使用是还是List比较多。

数组比较简单

```
Gson gson = new Gson();
String jsonArray = "[\"Android\",\"Java\",\"PHP\"]";
String[] strings = gson.fromJson(jsonArray, String[].class);
```

但对于List将上面的代码中的 String[].class 直接改为 List<String>.class 是行不通的。对于Java来说List<String> 和List<User> 这俩个的字节码文件只一个那就是List.class，这是Java泛型使用时要注意的问题 泛型擦除。

为了解决的上面的问题，Gson为我们提供了TypeToken来实现对泛型的支持，所以当我们希望使用将以上的数据解析为List<String>时需要这样写。

```
Gson gson = new Gson();
String jsonArray = "[\"Android\",\"Java\",\"PHP\"]";
String[] strings = gson.fromJson(jsonArray, String[].class);
List<String> stringList = gson.fromJson(jsonArray, new TypeToken<List<String>>() {}.getType());
```

注：TypeToken的构造方法是protected修饰的,所以上面才会写成new TypeToken<List<String>>() {}.getType() 而不是new TypeToken<List<String>>().getType()

## 泛型解析对接口POJO的设计影响 ##

泛型的引入可以减少无关的代码，如下两类服务端响应数据：

```
{"code":"0","message":"success","data":{}}
{"code":"0","message":"success","data":[]}
```

我们真正需要的data所包含的数据，而code只使用一次，message则几乎不用。如果Gson不支持泛型或不知道Gson支持泛型的同学一定会这么定义POJO。

```
public class UserResponse {
    public int code;
    public String message;
    public User data;
}
```

当其它接口的时候又重新定义一个XXResponse将data的类型改成XX，很明显code和message被重复定义了多次，通过泛型的话我们可以将code和message字段抽取到一个Result的类中，这样我们只需要编写data字段所对应的POJO即可，更专注于我们的业务逻辑。

```
public class Result<T> {
    public int code;
    public String message;
    public T data;
}
```

那么对于data字段是User时就可以这么写

```
Type userType = new TypeToken<Result<User>>(){}.getType();
Result<User> userResult = gson.fromJson(json,userType);
User user = userResult.data;

Type userListType = new TypeToken<Result<List<User>>>(){}.getType();
Result<List<User>> userListResult = gson.fromJson(json,userListType);
List<User> users = userListResult.data;
```

## Gson泛型封装 ##

每次都要用 new TypeToken<XXX>(){}; 好麻烦，有没有更好的办法?

### 约定 ###

1、本文涉及到的json格式

```
// data 为 object 的情况
{"code":"0","message":"success","data":{}}
// data 为 array 的情况
{"code":"0","message":"success","data":[]}
```

2、假定第一种的对应的Java类型为 Result<XXX> ，第二种为 Result<List<XXX>>

### 为何封装： ###
- 写new TypeToken<XXX>(){} 麻烦，IDE格式化后还不好看
- 对于任意类XXX都只有两种情况new TypeToken<Result<XXX>>(){}和new TypeToken<Result<List<XXX>>>(){}
- 方便统一管理

### 如何封装 ###

从上面的我们可以知道，最简单的方法就是提供两个方法分别对应data为Array和Object的情况并接收一个参数，即告知XXX的类型，自动将完成new TypeToken<XXX>(){}与new  TypeToken<Result<List<XXX>>>(){}的过程。

方法原型：

```
// 处理 data 为 object 的情况
public static <T> Result<T> fromJsonObject(Reader reader, Class<T> clazz) {}
// 处理 data 为 array 的情况
public static <T> Result<List<T>> fromJsonArray(Reader reader, Class<T> clazz){}
```

### 错误的尝试 ###

```
public static <T> Result<List<T>> fromJsonArray(Reader reader) {
    Type type = new TypeToken<Result<List<T>>>(){}.getType();
    return GSON.fromJson(reader, type);
}
```

代码不会报错，但运行结果肯定是不对的，因为这里的T其实是一个TypeVariable，他在运行时并不会变成我们想要的XXX，所以通过TypeToken得到的泛型信息只是Result<List<T>>。

### 一种解决方式：生成Type ###

既然TypeToken的作用是用于获取泛型的类，返回的类型为Type，真正的泛型信息就是放在这个Type里面，既然用TypeToken生成会有问题,那我们自己生成Type就行了嘛。

Type是Java中所有类型的父接口，在1.8以前是一个空接口，自1.8起多了个getTypeName()方法，下面有ParameterizedType、GenericArrayType、 WildcardType、 TypeVariable几个接口，以及Class类。这几个接口在本次封装过程中只会用到 ParameterizedType ，所以简单说一下：

ParameterizedType简单说来就是形如“类型<>”的类型，如:Map<String,User>。下面就以Map<String,User>为例讲一下里面各个方法的作用。

```
public interface ParameterizedType extends Type {
     // 返回Map<String,User>里的String和User，所以这里返回[String.class,User.clas]
    Type[] getActualTypeArguments();
    // Map<String,User>里的Map,所以返回值是Map.class
    Type getRawType();
    // 用于这个泛型上中包含了内部类的情况,一般返回null
    Type getOwnerType();
}
```

所以，知道了这里需要的泛型是怎么回事，一切都好说了，下面我们来完成之前留下的空方法。

1、实现一个简易的 ParameterizedType

```
public class ParameterizedTypeImpl implements ParameterizedType {
    private final Class raw;
    private final Type[] args;
    public ParameterizedTypeImpl(Class raw, Type[] args) {
        this.raw = raw;
        this.args = args != null ? args : new Type[0];
    }
    @Override
    public Type[] getActualTypeArguments() {
        return args;
    }
    @Override
    public Type getRawType() {
        return raw;
    }
    @Override
    public Type getOwnerType() {return null;}
}
```

2、生成Gson需要的泛型

```
// 解析data是object的情况
public static <T> Result<T> fromJsonObject(Reader reader, Class<T> clazz) {
    Type type = new ParameterizedTypeImpl(Result.class, new Class[]{clazz});
    return GSON.fromJson(reader, type);
}

// 解析data是array的情况
public static <T> Result<List<T>> fromJsonArray(Reader reader, Class<T> clazz) {
    // 生成List<T> 中的 List<T>
    Type listType = new ParameterizedTypeImpl(List.class, new Class[]{clazz});
    // 根据List<T>生成完整的Result<List<T>>
    Type type = new ParameterizedTypeImpl(Result.class, new Type[]{listType});
    return GSON.fromJson(reader, type);
}
```

最后借这次机会给安利一个简易的泛型生成库[TypeBuilder](https://github.com/ikidou/TypeBuilder)，其最初实现的目的就是让大家快速的生成泛型信息，同时也会作一些参数检查，保证正确性。

用上面的代码给大家举个例子

```
public static <T> Result<List<T>> fromJsonArray(Reader reader, Class<T> clazz) {
    Type type = TypeBuilder
            .newInstance(Result.class)
            .beginSubType(List.class)
            .addTypeParam(clazz)
            .endSubType()
            .build();
    return GSON.fromJson(reader, type);
}

public static <T> Result<T> fromJsonObject(Reader reader, Class<T> clazz) {
    Type type = TypeBuilder
            .newInstance(Result.class)
            .addTypeParam(clazz)
            .build();
    return GSON.fromJson(reader, type);
}
```

> 原文作者： @怪盗kidou  <br/>
> http://www.jianshu.com/p/e740196225a4  <br/>
> http://www.jianshu.com/p/d62c2be60617  <br/>
