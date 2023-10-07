import { initializeApp, getApps, cert } from 'firebase-admin/app';



const firebaseAdminConfig = {
    credential: cert({
        projectId: "quixai-dev",
        clientEmail: "firebase-adminsdk-ykjza@quixai-dev.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQDNH3SZCj3ePLmI\n9UBvOxdLrlgQ82SLP1rnyPdMebnhToayCmkB9jync7gI/sF9KQuYOHby3WfzGUPG\nUOH7TgB2ncCwKqroMCSjicLkPctW4MuDjm439jBqQ9LEix5AanyXdCeVNfXWIYL6\nX6u3DrL1g0Ldun94SIwjxivLWzHZvNaoQUD3QQ6HMiChGr0dPURRtKctekc9R5OK\nTlwuF3CiedAUPzIDaCHzfhyfcDBD0AaGvlJWkBZxXrgSe8UmhsxDQJ/avb+19Vva\npzLKMDesQ42X9nRfbvwJXQLdE3prBHvlObztTPvJij7vZgUMuefljupf1bDZqzfC\nmlC69FPvAgMBAAECgf8ToW8HNnO1URpwgQgpnP4dwBGtjZ2Rtf59MD56kyu25Ez/\nvP9PsMEdRXXXZood8E+rwbuggo/wM/rIf/Ugl9Zzg6VtNqgkkHbxL733GfLb3aec\nb4Uc1fLMOLFzHd1HTOmflP40yXU9iPd//qfwXPfDh0xe6/pHCKpgwhZu38tliwEP\nOq5bUIe+9dWhj9HiJZ/JpgfS0V31hwt023ZEdGOkmlOqi7jUEo0N2mjwkPSWR5wv\nYzaIhLO0+709mdC0Soa6EApk4iqcrkS4mCgu3SiOi4VyuFEww43V/w/74Iy1sde4\nuxR5Zc70+ws8MC0wgkqjweGZGcSAtB8t29CcLGUCgYEA812nZQ8efG8BIT5PwJsU\n1qETbGmyq7D6IbpLwan1bm/R+fUjcbzCEpqtpt4rxLBwVNwANuOloeeUILwKQpO9\nArs69g4t8InuE2YQEuxzcED8yPt7Jz+gWQ6TjYmxjlCmrKJLYlm12xzRXPMG0m0i\nJuymCrKvfZhe64Wnx5sCdQMCgYEA18WM5XU939RfLXOMzg+Q1tzM7LB3P9aMGSnZ\nqOMLeVdPVewx0UOSbBCsQ6yeVROHbh20uQLIpm27et/zidWYW6E3HTCe2asDTrS3\nvu0xX8H3lamiU0jBoe/PvqzUgrSMSEyc1dKEgDv8ytVgHwDriyykvJ2qN2YrpkeZ\nyCVKo6UCgYAH5BiCaVwWss65kjipyR2C3BQyJrc5Y/KoV08Ph4BCxXNshGtSy8kL\nK2LID1oh9Yqe5cdIAFeliUm/SfmXMQ0m4oVF5y3MJ9zFWkDZLDuN/z1zEtxqaGC9\nooBcTYOpVqog3N5O4RPJeAS9289z0UATPQchP6v7CY7CWkIXccpBmwKBgEhyz2U4\nIYdnMnH7a1rBBTvvtWr/sXqg2jeUwr2fRnn+o+fQv8Vo7+ATFRRAAIXGYeHKXaUF\nV0PyclHGomo0aszRa8UET0H81sZ1jYCw+bQSV8RLyfI26rUp5VI7i7s7TiL0fnCZ\nF95Kxg2A6Z5fW7dGTSX7tmyVhLB3OB5ozw/1AoGAcMNxoHMeiUIVoOTRvmxcT0iW\n7THBQY6/9WnJeazWeqPSh3svblND8fzadFjL2b4DX3xkVzmv75y5xEkoG2Wj2VNV\nX8cyPKz1PWjDdhpBpf/YKAawlxKwcCSl9aNGBNUYJGw0S28fS6ZL6inn4uToal4t\nOQKiEbWO6Yxb+H6XfoQ=\n-----END PRIVATE KEY-----\n"
      })
}

export function customInitApp() {
    if (getApps().length <= 0) {
        initializeApp(firebaseAdminConfig);
    }
}
