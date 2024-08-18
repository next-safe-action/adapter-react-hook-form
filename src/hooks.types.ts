import type { SafeActionFn } from "next-safe-action";
import type { Infer, Schema } from "next-safe-action/adapters/types";
import type {
	HookBaseUtils,
	HookCallbacks,
	UseActionHookReturn,
	UseOptimisticActionHookReturn,
} from "next-safe-action/hooks";
import type { UseFormProps, UseFormReturn } from "react-hook-form";
import type { ErrorMapperProps } from "./index.types";

/**
 * Optional props for `useHookFormAction` and `useHookFormOptimisticAction`.
 */
export type HookProps<
	ServerError,
	S extends Schema | undefined,
	BAS extends readonly Schema[],
	CVE,
	CBAVE,
	Data,
	FormContext = any,
> = {
	errorMapProps?: ErrorMapperProps;
	actionProps?: HookBaseUtils<S> & HookCallbacks<ServerError, S, BAS, CVE, CBAVE, Data>;
	formProps?: Omit<UseFormProps<S extends Schema ? Infer<S> : any, FormContext>, "resolver">;
};

/**
 * Type of the return object of the `useHookFormAction` hook.
 */
export type UseHookFormActionHookReturn<
	ServerError,
	S extends Schema | undefined,
	BAS extends readonly Schema[],
	CVE,
	CBAVE,
	Data,
	FormContext = any,
> = {
	action: UseActionHookReturn<ServerError, S, BAS, CVE, CBAVE, Data>;
	form: UseFormReturn<S extends Schema ? Infer<S> : any, FormContext>;
	handleSubmitWithAction: (e?: React.BaseSyntheticEvent) => Promise<void>;
	resetFormAndAction: () => void;
};

/**
 * Type of the return object of the `useHookFormOptimisticAction` hook.
 */
export type UseHookFormOptimisticActionHookReturn<
	ServerError,
	S extends Schema | undefined,
	BAS extends readonly Schema[],
	CVE,
	CBAVE,
	Data,
	State,
	FormContext = any,
> = Omit<UseHookFormActionHookReturn<ServerError, S, BAS, CVE, CBAVE, Data, FormContext>, "action"> & {
	action: UseOptimisticActionHookReturn<ServerError, S, BAS, CVE, CBAVE, Data, State>;
};

/**
 * Infer the type of the return object of the `useHookFormAction` hook.
 */
export type InferUseHookFormActionHookReturn<T extends Function, FormContext = any> =
	T extends SafeActionFn<
		infer ServerError,
		infer S extends Schema | undefined,
		infer BAS extends readonly Schema[],
		infer CVE,
		infer CBAVE,
		infer Data
	>
		? UseHookFormActionHookReturn<ServerError, S, BAS, CVE, CBAVE, Data, FormContext>
		: never;

/**
 * Infer the type of the return object of the `useHookFormOptimisticAction` hook.
 */
export type InferUseHookFormOptimisticActionHookReturn<T extends Function, State, FormContext = any> =
	T extends SafeActionFn<
		infer ServerError,
		infer S extends Schema | undefined,
		infer BAS extends readonly Schema[],
		infer CVE,
		infer CBAVE,
		infer Data
	>
		? UseHookFormOptimisticActionHookReturn<ServerError, S, BAS, CVE, CBAVE, Data, State, FormContext>
		: never;
