/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment LocationFields on Location {\n    id\n    code\n    name\n    active\n  }\n": typeof types.LocationFieldsFragmentDoc,
    "\n  fragment MaterialFields on Material {\n    id\n    code\n    name\n    active\n  }\n": typeof types.MaterialFieldsFragmentDoc,
    "\n  fragment BrightnessFields on Brightness {\n    id\n    code\n    value\n    active\n  }\n": typeof types.BrightnessFieldsFragmentDoc,
    "\n  fragment RefreshRateFields on RefreshRate {\n    id\n    code\n    value\n    active\n  }\n": typeof types.RefreshRateFieldsFragmentDoc,
    "\n  fragment SensorFields on Sensor {\n    id\n    code\n    name\n    active\n  }\n": typeof types.SensorFieldsFragmentDoc,
    "\n  fragment ControlTypeFields on ControlType {\n    id\n    code\n    name\n    active\n  }\n": typeof types.ControlTypeFieldsFragmentDoc,
    "\n  fragment ModuleOptionFields on Module {\n    id\n    code\n    sku\n    name\n    active\n  }\n": typeof types.ModuleOptionFieldsFragmentDoc,
    "\n  fragment PitchFields on Pitch {\n    id\n    code\n    pitchValue\n    active\n  }\n": typeof types.PitchFieldsFragmentDoc,
    "\n  fragment CabinetOptionFields on Cabinet {\n    id\n    code\n    sku\n    name\n    active\n  }\n": typeof types.CabinetOptionFieldsFragmentDoc,
    "\n  \n  \n  \n  \n  \n  \n  \n  \n\n  query GetInitialData {\n    screenTypes(onlyActive: true) { id code name }\n    locations { ...LocationFields }\n    materials { ...MaterialFields }\n    ipProtections(onlyActive: true) { id code }\n    brightnesses(onlyActive: true) { ...BrightnessFields }\n    refreshRates(onlyActive: true) { ...RefreshRateFields }\n    sensors(onlyActive: true) { ...SensorFields }\n    controlTypes(onlyActive: true) { ...ControlTypeFields }\n    moduleOptions(onlyActive: true) { ...ModuleOptionFields }\n    pitches(onlyActive: true) { ...PitchFields }\n  }\n": typeof types.GetInitialDataDocument,
    "\n  \n  query GetCabinetOptions($filters: CabinetFilterInput, $onlyActive: Boolean) {\n    cabinetOptions(filters: $filters, onlyActive: $onlyActive) {\n      ...CabinetOptionFields\n    }\n  }\n": typeof types.GetCabinetOptionsDocument,
};
const documents: Documents = {
    "\n  fragment LocationFields on Location {\n    id\n    code\n    name\n    active\n  }\n": types.LocationFieldsFragmentDoc,
    "\n  fragment MaterialFields on Material {\n    id\n    code\n    name\n    active\n  }\n": types.MaterialFieldsFragmentDoc,
    "\n  fragment BrightnessFields on Brightness {\n    id\n    code\n    value\n    active\n  }\n": types.BrightnessFieldsFragmentDoc,
    "\n  fragment RefreshRateFields on RefreshRate {\n    id\n    code\n    value\n    active\n  }\n": types.RefreshRateFieldsFragmentDoc,
    "\n  fragment SensorFields on Sensor {\n    id\n    code\n    name\n    active\n  }\n": types.SensorFieldsFragmentDoc,
    "\n  fragment ControlTypeFields on ControlType {\n    id\n    code\n    name\n    active\n  }\n": types.ControlTypeFieldsFragmentDoc,
    "\n  fragment ModuleOptionFields on Module {\n    id\n    code\n    sku\n    name\n    active\n  }\n": types.ModuleOptionFieldsFragmentDoc,
    "\n  fragment PitchFields on Pitch {\n    id\n    code\n    pitchValue\n    active\n  }\n": types.PitchFieldsFragmentDoc,
    "\n  fragment CabinetOptionFields on Cabinet {\n    id\n    code\n    sku\n    name\n    active\n  }\n": types.CabinetOptionFieldsFragmentDoc,
    "\n  \n  \n  \n  \n  \n  \n  \n  \n\n  query GetInitialData {\n    screenTypes(onlyActive: true) { id code name }\n    locations { ...LocationFields }\n    materials { ...MaterialFields }\n    ipProtections(onlyActive: true) { id code }\n    brightnesses(onlyActive: true) { ...BrightnessFields }\n    refreshRates(onlyActive: true) { ...RefreshRateFields }\n    sensors(onlyActive: true) { ...SensorFields }\n    controlTypes(onlyActive: true) { ...ControlTypeFields }\n    moduleOptions(onlyActive: true) { ...ModuleOptionFields }\n    pitches(onlyActive: true) { ...PitchFields }\n  }\n": types.GetInitialDataDocument,
    "\n  \n  query GetCabinetOptions($filters: CabinetFilterInput, $onlyActive: Boolean) {\n    cabinetOptions(filters: $filters, onlyActive: $onlyActive) {\n      ...CabinetOptionFields\n    }\n  }\n": types.GetCabinetOptionsDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment LocationFields on Location {\n    id\n    code\n    name\n    active\n  }\n"): (typeof documents)["\n  fragment LocationFields on Location {\n    id\n    code\n    name\n    active\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment MaterialFields on Material {\n    id\n    code\n    name\n    active\n  }\n"): (typeof documents)["\n  fragment MaterialFields on Material {\n    id\n    code\n    name\n    active\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment BrightnessFields on Brightness {\n    id\n    code\n    value\n    active\n  }\n"): (typeof documents)["\n  fragment BrightnessFields on Brightness {\n    id\n    code\n    value\n    active\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment RefreshRateFields on RefreshRate {\n    id\n    code\n    value\n    active\n  }\n"): (typeof documents)["\n  fragment RefreshRateFields on RefreshRate {\n    id\n    code\n    value\n    active\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment SensorFields on Sensor {\n    id\n    code\n    name\n    active\n  }\n"): (typeof documents)["\n  fragment SensorFields on Sensor {\n    id\n    code\n    name\n    active\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment ControlTypeFields on ControlType {\n    id\n    code\n    name\n    active\n  }\n"): (typeof documents)["\n  fragment ControlTypeFields on ControlType {\n    id\n    code\n    name\n    active\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment ModuleOptionFields on Module {\n    id\n    code\n    sku\n    name\n    active\n  }\n"): (typeof documents)["\n  fragment ModuleOptionFields on Module {\n    id\n    code\n    sku\n    name\n    active\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment PitchFields on Pitch {\n    id\n    code\n    pitchValue\n    active\n  }\n"): (typeof documents)["\n  fragment PitchFields on Pitch {\n    id\n    code\n    pitchValue\n    active\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment CabinetOptionFields on Cabinet {\n    id\n    code\n    sku\n    name\n    active\n  }\n"): (typeof documents)["\n  fragment CabinetOptionFields on Cabinet {\n    id\n    code\n    sku\n    name\n    active\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  \n  \n  \n  \n  \n  \n  \n\n  query GetInitialData {\n    screenTypes(onlyActive: true) { id code name }\n    locations { ...LocationFields }\n    materials { ...MaterialFields }\n    ipProtections(onlyActive: true) { id code }\n    brightnesses(onlyActive: true) { ...BrightnessFields }\n    refreshRates(onlyActive: true) { ...RefreshRateFields }\n    sensors(onlyActive: true) { ...SensorFields }\n    controlTypes(onlyActive: true) { ...ControlTypeFields }\n    moduleOptions(onlyActive: true) { ...ModuleOptionFields }\n    pitches(onlyActive: true) { ...PitchFields }\n  }\n"): (typeof documents)["\n  \n  \n  \n  \n  \n  \n  \n  \n\n  query GetInitialData {\n    screenTypes(onlyActive: true) { id code name }\n    locations { ...LocationFields }\n    materials { ...MaterialFields }\n    ipProtections(onlyActive: true) { id code }\n    brightnesses(onlyActive: true) { ...BrightnessFields }\n    refreshRates(onlyActive: true) { ...RefreshRateFields }\n    sensors(onlyActive: true) { ...SensorFields }\n    controlTypes(onlyActive: true) { ...ControlTypeFields }\n    moduleOptions(onlyActive: true) { ...ModuleOptionFields }\n    pitches(onlyActive: true) { ...PitchFields }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetCabinetOptions($filters: CabinetFilterInput, $onlyActive: Boolean) {\n    cabinetOptions(filters: $filters, onlyActive: $onlyActive) {\n      ...CabinetOptionFields\n    }\n  }\n"): (typeof documents)["\n  \n  query GetCabinetOptions($filters: CabinetFilterInput, $onlyActive: Boolean) {\n    cabinetOptions(filters: $filters, onlyActive: $onlyActive) {\n      ...CabinetOptionFields\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;