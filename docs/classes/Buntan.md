[@takoyaro/buntan](../README.md) / [Exports](../modules.md) / Buntan

# Class: Buntan

## Table of contents

### Constructors

- [constructor](Buntan.md#constructor)

### Properties

- [DB](Buntan.md#db)
- [LOG\_LEVEL](Buntan.md#log_level)
- [pipe](Buntan.md#pipe)
- [repo\_name](Buntan.md#repo_name)

### Accessors

- [log\_level](Buntan.md#log_level-1)

### Methods

- [collection](Buntan.md#collection)
- [dropDatabase](Buntan.md#dropdatabase)
- [getCollectionNames](Buntan.md#getcollectionnames)
- [init](Buntan.md#init)

## Constructors

### constructor

• **new Buntan**(`options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`IBuntanOptions`](../interfaces/internal_.IBuntanOptions.md) |

#### Defined in

src/Buntan.ts:12

## Properties

### DB

• `Private` **DB**: `Map`<`string`, [`Collection`](Collection.md)\>

#### Defined in

src/Buntan.ts:9

___

### LOG\_LEVEL

• `Private` **LOG\_LEVEL**: [`LogLevels`](../enums/internal_.LogLevels.md) = `LogLevels.NONE`

#### Defined in

src/Buntan.ts:7

___

### pipe

• `Private` **pipe**: `any` = `null`

#### Defined in

src/Buntan.ts:8

___

### repo\_name

• `Private` **repo\_name**: `string` = `"sentence-transformers/all-MiniLM-L6-v2"`

#### Defined in

src/Buntan.ts:10

## Accessors

### log\_level

• `get` **log_level**(): [`LogLevels`](../enums/internal_.LogLevels.md)

#### Returns

[`LogLevels`](../enums/internal_.LogLevels.md)

#### Defined in

src/Buntan.ts:59

## Methods

### collection

▸ **collection**(`name`): [`Collection`](Collection.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`Collection`](Collection.md)

#### Defined in

src/Buntan.ts:37

___

### dropDatabase

▸ **dropDatabase**(): [`Buntan`](Buntan.md)

**`Description`**

Drops the entire database

#### Returns

[`Buntan`](Buntan.md)

#### Defined in

src/Buntan.ts:47

___

### getCollectionNames

▸ **getCollectionNames**(): `string`[]

**`Description`**

Lists all collections in the database.

#### Returns

`string`[]

#### Defined in

src/Buntan.ts:55

___

### init

▸ **init**(): `Promise`<[`Buntan`](Buntan.md)\>

#### Returns

`Promise`<[`Buntan`](Buntan.md)\>

#### Defined in

src/Buntan.ts:32
