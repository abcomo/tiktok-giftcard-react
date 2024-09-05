import styles from "./index.module.scss"
import backIcon from "../../assets/images/home/back-icon.svg";
import refreshIcon from "../../assets/images/referCode/refresh_icon.svg";
import {Input, message, Select, Table} from "antd";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import SizeBox from "../../components/SizeBox";
import CommonBtn from "../../components/CommonBtn";
import NumberInput from "../../components/NumberInput";
import {APIGenerateCode} from "../../api";
import copy from 'copy-to-clipboard';
import AppLayout from "../../components/Layout";
import {useLogin} from "../../provider/loginContext";
const ReferCodePage = () =>{
    const { userInfo } = useLogin()
    const navigate = useNavigate()
    const cancel = () =>{
        navigate('/');
    }

    const buildReferCodeWrap = () =>{
        if(userInfo?.userGrade === 1){
            return <FirstUserReferCodeWrap></FirstUserReferCodeWrap>
        }
        if(userInfo?.userGrade === 2){
            return <SecondUserReferCodeWrap></SecondUserReferCodeWrap>
        }
    }

    return <AppLayout>
        <div className={styles.confirmPage}>
            <div onClick={cancel} className={styles.back}>
                <img src={backIcon}></img> 戻る
            </div>
            <SizeBox h={20}></SizeBox>
            {
                buildReferCodeWrap()
            }
        </div>
    </AppLayout>
}

const FirstUserReferCodeWrap = () =>{
    const [loading, setLoading] = useState(false);
    const [diyLoading, setDiyLoading] = useState(false);
    const [referCodeValue, setReferCodeValue] = useState<string>();
    const [amount, setAmount] = useState<number>(1);
    const [numCodeList, setNumCodeList] = useState<string[]>([]);
    const [diyCodeList, setDiyCodeList] = useState<string[]>([]);
    const [generateCode, setGenerateCode] = useState<{
        code:string,
        use:boolean
    }[]>([

    ]);

    const { getUserInfoAsync } = useLogin()

    const generateCodeByNum = async () =>{
        setLoading(true);
        try{
            const resp = await APIGenerateCode({num:amount});
            if(resp.data.data){
                const data = resp.data.data
                setNumCodeList(data)
            }
        } catch (e){
            console.log(e)
        }
        setLoading(false);
    }

    const generateCodeByDiy = async () =>{
        setDiyLoading(true);
        try{
            const resp = await APIGenerateCode({codes:referCodeValue});
            if(resp.data.data){
                const data = resp.data.data
                setDiyCodeList(data)
                setReferCodeValue("")
            }
        } catch (e){
            console.log(e)
        }
        setDiyLoading(false);
    }

    const onCopy = (item:string) =>{
        copy(item);
        message.success("Copy success")
    }

    const getInvietCode = async () =>{
        const [data, err] = await getUserInfoAsync();
        if(err) return;
        if(data){
            const inviteCode = data.invitationCode
            if(inviteCode){
                const result = Object.entries(inviteCode).map(([key, value]) => {
                    return { code: key, use: value === 1 };
                });
                if(result.length >= 1){
                    setGenerateCode(result)
                }

            }
        }
    }

    useEffect(()=>{
        getInvietCode().then();
    }, [])

    return <div>
        <div>
            <div className={styles.refer_code_title_wrap}>
                输入你自定义邀请码(多个使用逗号分隔)
            </div>
            <div className={styles.flex_wrap}>
                <Input placeholder={"输入邀请码"}  value={referCodeValue} onChange={(e)=>{setReferCodeValue(e.target.value)}} className={styles.refer_input_wrap}></Input>
                {
                    referCodeValue && <CommonBtn loading={diyLoading} onClick={generateCodeByDiy} className={styles.btn}>生成</CommonBtn>
                }
            </div>

            {
                diyCodeList.length > 0 &&
              <div className={styles.code_wrap}>
                  {
                      diyCodeList.map(item=>{
                          return  <div onClick={()=>onCopy(item)} className={styles.item}>{item}</div>
                      })
                  }
                  {
                      diyCodeList && diyCodeList.length > 1 && <CommonBtn onClick={()=>onCopy(diyCodeList.join(","))}  style={{
                          height:"45px",
                          lineHeight:"25px",
                      }} >复制全部</CommonBtn>
                  }
              </div>
            }
        </div>
        <SizeBox h={50}></SizeBox>
        <div>
            <div className={styles.refer_code_title_wrap}>
                <span></span>输入你要生成的个数
            </div>
            <div className={styles.flex_wrap}>
                <NumberInput max={100} amount={amount} setAmount={(number)=>setAmount(number)}></NumberInput>
                {
                    amount && <CommonBtn loading={loading} onClick={generateCodeByNum}  className={styles.btn}>开始生成</CommonBtn>
                }
            </div>

            <div className={styles.code_wrap}>
                {
                    numCodeList.map(item=>{
                        return  <div onClick={()=>onCopy(item)} className={styles.item}>{item}</div>
                    })
                }
                {
                    numCodeList && numCodeList.length > 1 && <CommonBtn onClick={()=>onCopy(numCodeList.join(","))}  style={{
                        height:"45px",
                    lineHeight:"25px",
                    }} >复制全部</CommonBtn>
                }
            </div>


            <div className={styles.refer_code_title_wrap}>
                <span></span>已生成的邀请码
            </div>

            <div className={styles.code_wrap}>
                {
                    generateCode.map(item=>{
                        return  <div onClick={()=>onCopy(item.code)} className={`${styles.item} ${ item.use ? styles.used : "" }`}>{item.code}</div>
                    })
                }
                {
                    generateCode && generateCode.length > 1 && <CommonBtn onClick={()=>onCopy(generateCode.filter(item=>!item.use).map(item => item.code).join(","))}  style={{
                        height:"45px",
                        lineHeight:"25px",
                    }} >复制未使用的</CommonBtn>
                }
            </div>
        </div>
    </div>
}

const SecondUserReferCodeWrap = () =>{
    const [loading, setLoading] = useState(false);
    const [referCodeValue, setReferCodeValue] = useState<string>();
    const [generateCode, setGenerateCode] = useState<string>();
    const { userInfo, getUserInfo, getUserInfoAsync } = useLogin()
    const getDisabled = () =>{
        if(userInfo?.referralCode != null){
            return true
        }
    }

    useEffect(()=>{
        setReferCodeValue(userInfo?.referralCode)
        getInvietCode().then();
    }, [])

    const getInvietCode = async () =>{
        const [data, err] = await getUserInfoAsync();
        if(err) return;
        if(data){
            const inviteCode = data.invitationCode
            if(inviteCode){
                const keysArray = Object.keys(inviteCode);
                if(keysArray.length >= 1){
                    setGenerateCode(keysArray[0])
                }
            }
        }
    }

    const generateCodeByNum = async () =>{
        setLoading(true);
        try{
            const resp = await APIGenerateCode({num:1});
            if(resp.data.data){
                const data = resp.data.data
                setGenerateCode(data[0])
                return;
            }
            message.error("Error, Please try again!")
        } catch (e){
            message.error("Error, Please try again!")
            console.log(e)
        }
        setLoading(false);
    }

    return <div>
        <div>
            <div className={styles.refer_code_title_wrap}>
                <span>*</span>您绑定的邀请码
            </div>
            <div className={styles.flex_wrap}>
                <Input value={referCodeValue} disabled={getDisabled()} onChange={(e)=>{setReferCodeValue(e.target.value)}} className={styles.refer_input_wrap}></Input>
                {
                    referCodeValue && !getDisabled() && <CommonBtn loading={loading} className={styles.btn}>确定</CommonBtn>
                }
            </div>
        </div>
        <SizeBox h={50}></SizeBox>
        <div>
            <div className={styles.refer_code_title_wrap}>
                您的专属邀请码
            </div>
            <div className={styles.refresh_wrap}>
                <Input value={generateCode} disabled className={styles.refer_input_wrap}></Input>
                {
                    <img className={loading ? styles.rotate_x : styles.rotate_x_stop} onClick={generateCodeByNum} src={refreshIcon}></img>
                }
            </div>
        </div>
    </div>
}

export default ReferCodePage
