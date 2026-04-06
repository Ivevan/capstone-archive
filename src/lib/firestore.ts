import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { CapstoneProject } from "@/types/capstone";

const COLLECTION = "projects";

export async function fetchProjects(): Promise<CapstoneProject[]> {
  const q = query(collection(db, COLLECTION), orderBy("year", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title ?? "",
      authors: data.authors ?? [],
      panelMembers: data.panelMembers ?? [],
      adviser: data.adviser ?? "",
      year: data.year ?? new Date().getFullYear(),
      month: data.month ?? 1,
      thesisCoordinator: data.thesisCoordinator ?? "",
      keywords: data.keywords,
      driveLink: data.driveLink,
    } as CapstoneProject;
  });
}

export async function addProject(
  project: Omit<CapstoneProject, "id">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), project);
  return docRef.id;
}

export async function addProjectsBatch(
  projects: Omit<CapstoneProject, "id">[]
): Promise<string[]> {
  const ids: string[] = [];
  for (const project of projects) {
    const id = await addProject(project);
    ids.push(id);
  }
  return ids;
}
