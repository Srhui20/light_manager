import { Vector3 } from "three";
import { Model } from "./Model";
import { Comment } from "./Comment";


export interface PVertex {
    pos: Vector3;
    _attached_model?: Model;
    _attached_comment?: Comment;
}