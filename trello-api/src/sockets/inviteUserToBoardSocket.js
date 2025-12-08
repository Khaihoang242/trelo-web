
//Params socket se lay tu thu vien socket.io
export const inviteUserToBoardSocket = ( socket) => {
    // lang nghe su kien ma client emit len ten la FE_USER_INVITED_TO_BOARD
    socket.on('FE_USER_INVITED_TO_BOARD', (invitation) =>{
        // cach lamf nhanh va don gian : emit nguoc sk ve cho moi client khac ( ngoai tru chinhs cai thang gui request len) roi fe check
        socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
    })
}
