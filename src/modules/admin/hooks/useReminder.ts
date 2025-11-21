import { adminApi } from "@/api/admin.api";
import { toaster } from "@/components/ui/toaster";
import { useMutation } from "@tanstack/react-query";

export const useAttendanceReminder = (options?: {
    onCreateSuccess?: (result: { sent_to: string[] }) => void;
}) => {
    const createMutation = useMutation({
        mutationFn: (entityType: string) => adminApi.sendAttendanceReminder(entityType),
        onSuccess: (result) => {
            toaster.create({ description: `Reminder sent successfully to ${result.sent_to.join(", ")}`, type: "success", closable: true, duration: 5000 });
            options?.onCreateSuccess?.(result);
        }
    });

    return {
        createReminder: createMutation.mutate,
        isCreating: createMutation.isPending,
    };
};


export const useAttendanceEntityReminder = (options?: {
    onCreateSuccess?: (result: { sent_to: string[] }) => void;
}) => {
    const createMutation = useMutation({
        mutationFn: ({ entityType, entityId }: { entityType: string, entityId: number }) => adminApi.sendAttendanceEntityReminder(entityType, entityId),
        onSuccess: (result) => {
            toaster.create({ description: `Reminder sent successfully to ${result.sent_to.join(", ")}`, type: "success", closable: true, duration: 5000 });
            options?.onCreateSuccess?.(result);
        }
    });

    return {
        createReminder: createMutation.mutate,
        isCreating: createMutation.isPending,
    };
};