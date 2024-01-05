import { useParams } from 'next/navigation'

export default function FolderNavigation() {
  const params = useParams()

  const { folderId } = params
}
