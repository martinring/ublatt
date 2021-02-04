type EmailContent = void

export default Object.assign(function EMail(
  recipients: { email: string, name?: string },
  subject: string,
  content: EmailContent,

): Blob {  
  return new Blob([],{ type: 'message/rfc822' })
},{
  createPart(): EmailContent {    
  }
})