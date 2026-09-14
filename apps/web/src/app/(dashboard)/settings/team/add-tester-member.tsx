"use client";

import { useState } from "react";
import { Button } from "@usesend/ui/src/button";
import { KeyRoundIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@usesend/ui/src/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@usesend/ui/src/select";
import { Input } from "@usesend/ui/src/input";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import { toast } from "@usesend/ui/src/toaster";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@usesend/ui/src/form";
import { useTeam } from "~/providers/team-context";
import { useUpgradeModalStore } from "~/store/upgradeModalStore";
import { LimitReason } from "~/lib/constants/plans";

const addTesterSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "MEMBER"], {
    required_error: "Please select a role",
  }),
});

type FormData = z.infer<typeof addTesterSchema>;

export default function AddTesterMember() {
  const { currentIsAdmin } = useTeam();
  const limitsQuery = api.limits.get.useQuery({
    type: LimitReason.TEAM_MEMBER,
  });
  const { openModal } = useUpgradeModalStore((s) => s.action);
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(addTesterSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "MEMBER",
    },
  });

  const utils = api.useUtils();
  const createPasswordMember = api.team.createPasswordMember.useMutation();

  function onSubmit(values: FormData) {
    if (limitsQuery.data?.isLimitReached) {
      openModal(limitsQuery.data.reason);
      return;
    }

    createPasswordMember.mutate(values, {
      onSuccess: (result) => {
        form.reset();
        setOpen(false);
        void utils.team.getTeamUsers.invalidate();
        void utils.team.getTeamInvites.invalidate();
        toast.success(
          result.created
            ? `Tester account created for ${result.email}`
            : `Password updated for ${result.email}`,
        );
      },
      onError: (error) => {
        console.error(error);
        toast.error(error.message || "Failed to create tester account");
      },
    });
  }

  function onOpenChange(nextOpen: boolean) {
    if (nextOpen && limitsQuery.data?.isLimitReached) {
      openModal(limitsQuery.data.reason);
      return;
    }

    setOpen(nextOpen);
  }

  if (!currentIsAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <KeyRoundIcon className="mr-2 h-4 w-4" />
          Add Tester (Password)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add tester with password login</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="tester@example.com" {...field} />
                  </FormControl>
                  {formState.errors.email ? (
                    <FormMessage />
                  ) : (
                    <FormDescription>
                      The tester will sign in at /login with this email and
                      password.
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Minimum 8 characters" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <div className="capitalize">
                          {field.value.toLowerCase()}
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPasswordMember.isPending || limitsQuery.isLoading}
                isLoading={createPasswordMember.isPending}
                className="w-[180px]"
              >
                Create tester account
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
