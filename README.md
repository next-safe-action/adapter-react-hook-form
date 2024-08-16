<div align="center">
  <img src="https://raw.githubusercontent.com/TheEdoRan/next-safe-action/main/assets/logo.png" alt="next-safe-action logo" width="36" height="36">
  <a href="https://github.com/next-safe-action/adapter-react-hook-form"><h1>adapter-react-hook-form</h1></a>
</div>

This adapter offers a way to seamlessly integrate [next-safe-action](https://github.com/TheEdoRan/next-safe-action) with [react-hook-form](https://github.com/react-hook-form/react-hook-form).

# Requirements

- React >= `18.2.0`
- Next.js >= `14.0.0`
- next-safe-action >= `7.6.0`
- react-hook-form >= `7.0.0`
- @hookform/resolvers >= `3.0.0`

# Installation

```sh
npm i next-safe-action react-hook-form @hookform/resolvers @next-safe-action/adapter-react-hook-form # or yarn, pnpm
```

# Hooks

## `useHookFormAction`

This hook is a wrapper around `useAction` from next-safe-action and `useForm` from react-hook-form that makes it much easier to use safe actions with react-hook-form. It also maps validation errors to `FieldErrors` compatible with react-hook-form.

### Example (login)

1. First of all, we need a shared file to store our validation schema(s). In this case, the exported `loginSchema` Zod validator is exported from `validation.ts`:

```ts
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(8).max(100),
});
```

2. Then, we can create our login action using `loginSchema`:

```ts
"use server";

import { returnValidationErrors } from "next-safe-action";
import { actionClient } from "@/lib/safe-action";
import { loginSchema } from "./validation";
import { checkCredentials } from "@/services/auth";

export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }) => {
    const valid = await checkCredentials(
      parsedInput.username,
      parsedInput.password
    );

    // If the credentials are invalid, return root validation error.
    if (!valid) {
      returnValidationErrors(loginSchema, {
        _errors: ["Invalid username or password"],
      });
    }

    return {
      successful: true,
    };
  });
```

3. Finally, we can use `useHookFormAction` in our Client Component, by passing to it the `loginSchema` and `loginAction` declared above:

```tsx
"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "./validation";
import { loginAction } from "./login-action";

export function LoginForm() {
  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(loginAction, zodResolver(loginSchema), {
      actionProps: {},
      formProps: {},
      errorMapProps: {}
    });

  return <form onSubmit={handleSubmitWithAction}>...</form>;
}
```

### Parameters

- `safeAction`: the safe action (required)
- `hookFormResolver`: a react-hook-form validation resolver (required)
- `props`: props for `useAction`, `useForm` and error mapper (optional)

### Return values (object)

- `form`: the react-hook-form form
- `action`: the next-safe-action action
- `handleSubmitWithAction`: a function that handles form submission by automatically executing the action
- `resetFormAndAction`: a function that resets the form and the action state

## `useHookFormOptimisticAction`

This hook is a wrapper around `useAction` from next-safe-action and `useForm` from react-hook-form that makes it much easier to use safe actions with react-hook-form. It also maps validation errors to `FieldErrors` compatible with react-hook-form.

### Example (add todo)

1. First of all, we need a shared file to store our validation schema(s). In this case, the exported `addTodoSchema` Zod validator is exported from `validation.ts`:

```ts
import { z } from "zod";

export const addTodoSchema = z.object({
  newTodo: z.string().min(1).max(200),
});
```

2. Then, we can create our add todo action using `addTodoSchema`:

```ts
"use server";

import { returnValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { addTodoSchema } from "./validation";
import { badWordsCheck } from "@/utils";
import { saveTodoInDb } from "@/services/db";

export const addTodoAction = actionClient
  .schema(addTodoSchema)
  .action(async ({ parsedInput }) => {
    const containsBadWords = badWordsCheck(parsedInput.newTodo)

    // If the todo con
    if (containsBadWords) {
      returnValidationErrors(addTodoSchema, {
        newTodo: {
          _errors: ["The todo contains bad words!"],
        }
      });
    }

    await saveTodoInDb(parsedInput.newTodo);
    revalidatePath("/");

    return {
      newTodo: parsedInput.newTodo,
    };
  });
```

3. Finally, we can use `useHookFormOptimisticAction` in our Client Component, by passing to it the `addTodoSchema` and `addTodoAction` declared above:

```tsx
"use client";

import { useHookFormOptimisticAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { addTodoSchema } from "./validation";
import { addTodoAction } from "./addtodo-action";

type Props = {
  todos: string[];
};

// Todos are passed from the parent Server Component and updated each time a new todo is added
// thanks to the `revalidatePath` function called inside the action.
export function AddTodoForm({ todos }: Props) {
  const { form, action, handleActionSubmit, resetFormAndAction } =
    useHookFormOptimisticAction(addTodoAction, zodResolver(addTodoSchema), {
      actionProps: {
        currentState: {
          todos,
        },
        updateFn: (state, input) => {
          return {
            todos: [...state.todos, input.newTodo],
          };
        },
      },
      formProps: {},
      errorMapProps: {},
    });

  return <form onSubmit={handleActionSubmit}></form>;
}
```

### Parameters

- `safeAction`: the safe action (required)
- `hookFormResolver`: a react-hook-form validation resolver (required)
- `props`: props for `useAction`, `useForm` and error mapper. `actionProps.currentState` and `actionProps.updateFn` are required by the `useOptimisticAction` hook used under the hood, the rest are optional. (required/optional)

### Return values (object)

- `form`: the react-hook-form form
- `action`: the next-safe-action action
- `handleSubmitWithAction`: a function that handles form submission by automatically executing the action
- `resetFormAndAction`: a function that resets the form and the action state

## `useHookFormActionErrorMapper`

For more control over the execution flow, you can use this hook to get back the memoized mapped validation errors of the action. It can be useful for cases when you need to use both `useAction` and `useForm` in your Client Component, for a particular task, or when you want to create custom hooks.

### Example (Client Component)

1. We'll reuse the `loginSchema` and `loginAction` from the `useHookFormAction` example  here.

2. Here's how you would use `useHookFormActionErrorMapper` in your Client Component:

```tsx
"use client";

import { useHookFormActionErrorMapper } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "./validation";
import { loginAction } from "./login-action";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { Infer } from "next-safe-action/adapters/types";

export function CustomForm() {
  const action = useAction(loginAction);

  const { hookFormValidationErrors } = useHookFormActionErrorMapper<
    typeof loginSchema
  >(action.result.validationErrors, { joinBy: "\n" });

  const form = useForm<Infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    errors: hookFormValidationErrors,
  });

  return <form onSubmit={form.handleSubmit(action.executeAsync)}>...</form>;
}
```

### Parameters

- `validationErrors`: next-safe-action object of `ValidationErrors`, or `undefined` (required)
- `props`: `joinBy` from `ErrorMapperProps` type. It's used to determine how to join the error messages, if more than one is present in the errors array. It defaults to `" "`  (optional)

### Return values (object)
- `hookFormValidationErrors`: object of mapped errors with `FieldErrors` type, compatible with react-hook-form

# Utilities

## `mapToHookFormErrors`

For more advanced stuff, you can directly use the `mapToHookFormErrors` function that is utilized under the hood to map next-safe-action `ValidationErrors` to react-hook-form compatible `FieldErrors`.

### Example

```typescript
import { mapToHookFormErrors } from "@next-safe-action/adapter-react-hook-form";
import { loginAction } from "./login-action";
import type { loginSchema } from "./validation";

async function advancedStuff() {
  const result = await loginAction({ username: "foo", password: "bar" });
  const hookFormValidationErrors = mapToHookFormErrors<
    typeof loginSchema
  >(result?.validationErrors, { joinBy: "\n" });

  // Do something with `hookFormValidationErrors`...
}
```

### Parameters

- `validationErrors`: next-safe-action object of `ValidationErrors`, or `undefined` (required)
- `props`: `joinBy` from `ErrorMapperProps` type. It's used to determine how to join the error messages, if more than one is present in the errors array. It defaults to `" "`  (optional)

### Return value
- mapped errors: object of mapped errors with `FieldErrors` type, compatible with react-hook-form

# Types

## `/`

### `ErrorMapperProps`

Props for `mapToHookFormErrors`. Also used by the hooks.

```typescript
export type ErrorMapperProps = {
  joinBy?: string;
};
```

## `/hooks`

### `HookProps`

Optional props for `useHookFormAction` and `useHookFormOptimisticAction`.

```typescript
export type HookProps<ServerError, S extends Schema, BAS extends readonly Schema[], CVE, CBAVE, Data> = {
  errorMapProps?: ErrorMapperProps;
  actionProps?: HookBaseUtils<S> & HookCallbacks<ServerError, S, BAS, CVE, CBAVE, Data>;
  formProps?: Omit<UseFormProps<Infer<S>, any>, "resolver">;
};
```

# License

This project is released under the [MIT License](https://github.com/next-safe-action/adapter-react-hook-form/blob/main/LICENSE).

