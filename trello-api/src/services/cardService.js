/* eslint-disable indent */
/* eslint-disable no-useless-catch */
import { cardModel } from "~/models/cardModel";
import { columnModel } from "~/models/columnModel";
import { CloudinaryProvider } from '~/providers/CloudinaryProvider';

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody,
    };
    const createdCard = await cardModel.createNew(newCard);
    const getNewCard = await cardModel.findOneById(
      createdCard.insertedId.toString()
    );
    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard);
    }
    return getNewCard;
  } catch (error) {
    throw error;
  }
};
const update = async (cardId, reqBody,cardCoverFile,userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    let updatedCard = {}
    if (cardCoverFile) {
       // truong hop upload file len cloud Storage 
       const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')

       // luu lai url (secure_url) cua cai file anh vao trong DB
       updatedCard = await cardModel.update(cardId, {
         cover: uploadResult.secure_url
       })
    } else if (updateData.commentToAdd) {
      //tao du lieu comment de them vao db 
      const commentData ={
        ...updateData.commentToAdd,
        commentedAt : Date.now(),
        userId : userInfo._id,
        userEmail: userInfo.email
      }
      updatedCard = await cardModel.unshiftNewComment(cardId,commentData)
// truong hop add hoac remove thanh vien ra khoi card 
    } else if (updateData.incomingMemberInfo) {
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)
    } else {
      // cac truong hop update chung nhu title, des
      updatedCard = await cardModel.update(cardId, updateData)
    }

     

    return updatedCard
  } catch (error) {
    throw error
  }
}
export const cardService = {
  createNew,
  update
};
