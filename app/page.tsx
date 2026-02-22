import { groupStudents, listStudents } from "@/lib/students";
import MajorsTree from "@/components/MajorsTree";

export default async function Home() {
  const students = await listStudents();
  const grouped = groupStudents(students);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <MajorsTree grouped={grouped} />
      </div>
    </div>
  );
}
