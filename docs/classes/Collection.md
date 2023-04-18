[@takoyaro/buntan](../README.md) / [Exports](../modules.md) / Collection

# Class: Collection

## Table of contents

### Constructors

- [constructor](Collection.md#constructor)

### Properties

- [LOG\_LEVEL](Collection.md#log_level)
- [PIPE](Collection.md#pipe)
- [documents](Collection.md#documents)
- [name](Collection.md#name)

### Methods

- [delete\_many](Collection.md#delete_many)
- [delete\_one](Collection.md#delete_one)
- [embed\_string](Collection.md#embed_string)
- [insert\_many](Collection.md#insert_many)
- [insert\_one](Collection.md#insert_one)
- [load\_collection](Collection.md#load_collection)
- [query\_by\_id](Collection.md#query_by_id)
- [query\_by\_metadata](Collection.md#query_by_metadata)
- [query\_similarity](Collection.md#query_similarity)

## Constructors

### constructor

• **new Collection**(`db`, `name`, `pipe`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `db` | [`Buntan`](Buntan.md) |
| `name` | `string` |
| `pipe` | `any` |

#### Defined in

src/Collection.ts:11

## Properties

### LOG\_LEVEL

• `Private` **LOG\_LEVEL**: [`LogLevels`](../enums/internal_.LogLevels.md)

#### Defined in

src/Collection.ts:5

___

### PIPE

• `Private` **PIPE**: `any`

#### Defined in

src/Collection.ts:6

___

### documents

• **documents**: [`IDocument`](../interfaces/internal_.IDocument.md)[] = `[]`

#### Defined in

src/Collection.ts:9

___

### name

• **name**: `string`

#### Defined in

src/Collection.ts:8

## Methods

### delete\_many

▸ **delete_many**(`ids`): [`IDocument`](../interfaces/internal_.IDocument.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `ids` | `string`[] |

#### Returns

[`IDocument`](../interfaces/internal_.IDocument.md)[]

#### Defined in

src/Collection.ts:153

___

### delete\_one

▸ **delete_one**(`id`): ``null`` \| [`IDocument`](../interfaces/internal_.IDocument.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

``null`` \| [`IDocument`](../interfaces/internal_.IDocument.md)[]

#### Defined in

src/Collection.ts:147

___

### embed\_string

▸ `Private` **embed_string**(`str`): `Promise`<[`IEmbedding`](../interfaces/internal_.IEmbedding.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `str` | `string` |

#### Returns

`Promise`<[`IEmbedding`](../interfaces/internal_.IEmbedding.md)\>

#### Defined in

src/Collection.ts:20

___

### insert\_many

▸ **insert_many**(`docs`): `Promise`<[`IDocument`](../interfaces/internal_.IDocument.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `docs` | { `data`: `string` ; `metadata`: [`Record`](../modules/internal_.md#record)<`string`, `any`\>  }[] |

#### Returns

`Promise`<[`IDocument`](../interfaces/internal_.IDocument.md)[]\>

#### Defined in

src/Collection.ts:173

___

### insert\_one

▸ **insert_one**(`data`, `metadata?`): `Promise`<[`IDocument`](../interfaces/internal_.IDocument.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `metadata?` | [`Record`](../modules/internal_.md#record)<`any`, `any`\> |

#### Returns

`Promise`<[`IDocument`](../interfaces/internal_.IDocument.md)\>

#### Defined in

src/Collection.ts:159

___

### load\_collection

▸ **load_collection**(`docs`): `Promise`<[`Collection`](Collection.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `docs` | [`IDocument`](../interfaces/internal_.IDocument.md)[] |

#### Returns

`Promise`<[`Collection`](Collection.md)\>

#### Defined in

src/Collection.ts:26

___

### query\_by\_id

▸ **query_by_id**(`id`): `undefined` \| ``null`` \| [`IDocument`](../interfaces/internal_.IDocument.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`undefined` \| ``null`` \| [`IDocument`](../interfaces/internal_.IDocument.md)

#### Defined in

src/Collection.ts:133

___

### query\_by\_metadata

▸ **query_by_metadata**(`metadata`): [`IDocument`](../interfaces/internal_.IDocument.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `metadata` | [`Record`](../modules/internal_.md#record)<`any`, `any`\> |

#### Returns

[`IDocument`](../interfaces/internal_.IDocument.md)[]

#### Defined in

src/Collection.ts:138

___

### query\_similarity

▸ **query_similarity**(`data`, `options?`): `Promise`<[`IScoredDocument`](../interfaces/internal_.IScoredDocument.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `options` | `Object` |
| `options.filter?` | [`Record`](../modules/internal_.md#record)<`string`, `any`\> |
| `options.normalize?` | `boolean` |
| `options.top?` | `number` |

#### Returns

`Promise`<[`IScoredDocument`](../interfaces/internal_.IScoredDocument.md)[]\>

#### Defined in

src/Collection.ts:63
