import UploadZone from '../components/UploadZone';

export default function UploadPage() {
  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink tracking-tight mb-3">
          Bring your meeting
        </h1>
        <p className="font-body text-lg text-slate max-w-md mx-auto">
          Upload a recording and let AI turn it into a transcript, summary, and action items.
        </p>
      </div>

      <UploadZone />
    </div>
  );
}
