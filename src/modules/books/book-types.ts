import {FileEditAction} from "../../common/enums/file-edit-action.enum";

export interface AddBookFormData {
    title: string;
    author: string;
    description?: string;
    year?: string;
    cover?: File | null;
    source?: File | null;
}

export interface BookDataWithActionStatus extends AddBookFormData {
    id: string;
    coverPath?: string;
    sourcePath?: string;
    coverActionStatus?: FileEditAction;
    sourceActionStatus?: FileEditAction;
}
