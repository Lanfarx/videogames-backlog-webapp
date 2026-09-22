export default function Divider({ text }: { text?: string }) {
  return (
  <div className="flex items-center my-6">
    <div className="flex-grow h-px bg-gray-300" />
    {text && <span className="mx-4 text-sm text-gray-500">{text}</span>}
    <div className="flex-grow h-px bg-gray-300" />
  </div>
  );
}
