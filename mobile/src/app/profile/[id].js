import { useLocalSearchParams } from "expo-router";
import ProfileEditor from "@/components/ProfileEditor";

export default function EditProfile() {
  const { id } = useLocalSearchParams();
  return <ProfileEditor id={id} />;
}
