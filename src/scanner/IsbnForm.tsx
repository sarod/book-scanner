import { TextInput, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { isIsbn, removeHyphens } from "../books/isbn/isIsbn";
import type { ScannerProps } from "./ScannerProps";

export function IsbnForm({ onDetected }: ScannerProps) {
  const form = useForm<{ code: string }>({
    mode: "uncontrolled",
    validateInputOnChange: true,
    initialValues: { code: "" },
    validate: {
      code: (value) =>
        !isIsbn(removeHyphens((value || "").trim())) ? "Invalid ISBN" : null,
    },
  });
  return (
    <form
      onSubmit={form.onSubmit((values) => {
        console.log(values);
        onDetected(removeHyphens(values.code.trim()));
      })}
    >
      <TextInput
        label="Code"
        key={form.key("code")}
        autoComplete="true"
        {...form.getInputProps("code")}
      />
      <Button type="submit">Send</Button>
    </form>
  );
}
