"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { useTheme } from "next-themes"

interface EmojiPickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPickerDialog({ isOpen, onClose, onEmojiSelect }: EmojiPickerDialogProps) {
  const { theme } = useTheme()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0">
        <Picker
          data={data}
          onEmojiSelect={(emoji: any) => {
            onEmojiSelect(emoji.native)
            onClose()
          }}
          theme={theme === "dark" ? "dark" : "light"}
          set="native"
        />
      </DialogContent>
    </Dialog>
  )
}
